# API Consolidation Plan

## Overview

This document outlines the plan to consolidate the separate Cloudflare Worker (`qalam-api`) into the main Next.js application deployed on Cloudflare Pages. This simplifies the architecture, reduces deployment complexity, and narrows the troubleshooting scope.

## Current Architecture (Before)

```
┌─────────────────────────────────────────┐
│         CLOUDFLARE PAGES                │
│         (qalam project)                 │
├─────────────────────────────────────────┤
│  Next.js App                            │
│  ├── Pages & Components (SSR/Edge)      │
│  ├── /api/assess-translation (unused)   │
│  └── /public/data/* (static JSON)       │
└──────────────────┬──────────────────────┘
                   │ CORS API calls
                   ▼
┌─────────────────────────────────────────┐
│         CLOUDFLARE WORKER               │
│         (qalam-api project)             │
├─────────────────────────────────────────┤
│  POST /assess                           │
│  ├── KV caching (ASSESSMENT_CACHE)      │
│  ├── Together.ai LLM calls              │
│  └── Fetches data from Pages            │
└─────────────────────────────────────────┘
```

### Problems with Current Architecture

1. **Two deployment pipelines** - Pages and Worker deployed separately
2. **CORS configuration** - Worker needs to allow origins from Pages
3. **Duplicate code** - LLM logic exists in both Next.js and Worker
4. **Circular dependency** - Worker fetches data from Pages
5. **Environment variable duplication** - `TOGETHER_API_KEY` in both places
6. **Deployment failures** - Mixing GitHub integration with wrangler commands

## Target Architecture (After)

```
┌─────────────────────────────────────────┐
│         CLOUDFLARE PAGES                │
│         (qalam project)                 │
├─────────────────────────────────────────┤
│  Next.js App (Edge Runtime)             │
│  ├── Pages & Components                 │
│  ├── /api/assess-translation            │
│  │     ├── Check KV cache               │
│  │     ├── Call Together.ai if miss     │
│  │     └── Cache result in KV           │
│  └── /public/data/* (static JSON)       │
├─────────────────────────────────────────┤
│  Bindings:                              │
│  └── ASSESSMENT_CACHE (KV namespace)    │
└─────────────────────────────────────────┘
```

### Benefits of Consolidated Architecture

1. **Single deployment** - One `git push` deploys everything
2. **No CORS issues** - Same-origin API calls
3. **Single codebase** - All logic in one place
4. **Simpler debugging** - One set of logs, one project
5. **Preserved caching** - Same KV namespace, cached data retained

---

## Implementation Plan

### Phase 1: Add KV Caching to Next.js API Route

#### 1.1 Create Cache Utility

**File:** `src/lib/cache.ts`

```typescript
/**
 * KV Cache Helper for Assessment Results
 * Works with Cloudflare KV in Edge Runtime via @cloudflare/next-on-pages
 */

import type { AttemptFeedback } from '@/types'

// Cache TTL: 30 days (in seconds)
const CACHE_TTL = 30 * 24 * 60 * 60

/**
 * Generate a cache key from verseId and user translation
 */
export function getCacheKey(verseId: string, userTranslation: string): string {
  const normalized = userTranslation.toLowerCase().trim().replace(/\s+/g, ' ')

  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  const hashHex = (hash >>> 0).toString(16)
  return `assessment:${verseId}:${hashHex}`
}

/**
 * Get cached assessment from KV
 */
export async function getCachedAssessment(
  kv: KVNamespace | undefined,
  verseId: string,
  userTranslation: string
): Promise<AttemptFeedback | null> {
  if (!kv) return null

  const key = getCacheKey(verseId, userTranslation)
  try {
    return await kv.get(key, 'json') as AttemptFeedback | null
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

/**
 * Store assessment in KV cache
 */
export async function cacheAssessment(
  kv: KVNamespace | undefined,
  verseId: string,
  userTranslation: string,
  feedback: AttemptFeedback
): Promise<void> {
  if (!kv) return

  const key = getCacheKey(verseId, userTranslation)
  try {
    await kv.put(key, JSON.stringify(feedback), { expirationTtl: CACHE_TTL })
  } catch (error) {
    console.error('Cache write error:', error)
  }
}
```

#### 1.2 Update API Route

**File:** `src/app/api/assess-translation/route.ts`

Add KV caching using `@cloudflare/next-on-pages`:

```typescript
import { getRequestContext } from '@cloudflare/next-on-pages'
import { getCachedAssessment, cacheAssessment } from '@/lib/cache'

// In the POST handler:
export async function POST(request: NextRequest) {
  // Get Cloudflare bindings
  const { env } = getRequestContext()
  const kv = env.ASSESSMENT_CACHE as KVNamespace | undefined

  // ... validation code ...

  // Check cache first
  const cached = await getCachedAssessment(kv, verseId, trimmedTranslation)
  if (cached) {
    return NextResponse.json({
      success: true,
      data: { feedback: cached, referenceTranslation },
      cached: true,
    })
  }

  // ... LLM call code ...

  // Cache the result (fire and forget)
  cacheAssessment(kv, verseId, trimmedTranslation, feedback)

  return NextResponse.json({
    success: true,
    data: { feedback, referenceTranslation },
    cached: false,
  })
}
```

#### 1.3 Add TypeScript Declarations

**File:** `src/types/cloudflare.d.ts`

```typescript
// Cloudflare KV type for Edge Runtime
interface CloudflareEnv {
  ASSESSMENT_CACHE?: KVNamespace
}

declare module '@cloudflare/next-on-pages' {
  export function getRequestContext(): {
    env: CloudflareEnv
    ctx: ExecutionContext
    cf: IncomingRequestCfProperties
  }
}
```

---

### Phase 2: Configure Cloudflare Bindings

#### 2.1 Update wrangler.toml

**File:** `wrangler.toml`

```toml
# Qalam - Cloudflare Pages (Next.js with @cloudflare/next-on-pages)
name = "qalam"
compatibility_date = "2024-12-24"
pages_build_output_dir = ".vercel/output/static"

# KV Namespace for caching assessments (same as worker used)
[[kv_namespaces]]
binding = "ASSESSMENT_CACHE"
id = "221015cc0cd54b0b951396214433e4b8"
preview_id = "051d05919a3240c2b23006ece503dcdb"
```

#### 2.2 Cloudflare Dashboard Configuration

In the Cloudflare Pages project settings:

**Environment Variables:**
| Variable | Value | Environment |
|----------|-------|-------------|
| `TOGETHER_API_KEY` | (your key) | Production |
| `ASSESSMENT_BACKEND` | `together` | Production |

**KV Namespace Bindings:**
| Variable name | KV namespace |
|---------------|--------------|
| `ASSESSMENT_CACHE` | qalam-assessment-cache |

---

### Phase 3: Simplify Client Code

#### 3.1 Update VersePracticeClient

**File:** `src/app/browse/surah/[id]/[verse]/VersePracticeClient.tsx`

Remove the conditional API URL logic:

```typescript
// BEFORE:
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
// ...
const endpoint = API_URL ? `${API_URL}/assess` : '/api/assess-translation'

// AFTER:
const endpoint = '/api/assess-translation'
```

#### 3.2 Remove Environment Variable

Remove `NEXT_PUBLIC_API_URL` from:
- Cloudflare Pages environment variables
- Any `.env` files
- Documentation references

---

### Phase 4: Cleanup

#### 4.1 Files to Delete

```
worker/                          # Entire directory
├── src/
│   ├── index.ts
│   ├── handlers/
│   │   └── assess.ts
│   ├── lib/
│   │   ├── cache.ts
│   │   ├── llm.ts
│   │   └── prompts.ts
│   └── types.ts
├── wrangler.toml
├── package.json
├── package-lock.json
└── tsconfig.json
```

#### 4.2 Update package.json Scripts

Remove worker-related scripts:

```json
{
  "scripts": {
    // REMOVE these:
    "worker:dev": "cd worker && npm run dev",
    "worker:dev:remote": "cd worker && npm run dev:remote",
    "worker:deploy": "cd worker && npm run deploy"
  }
}
```

#### 4.3 Cloudflare Dashboard Cleanup

1. **Delete the `qalam-api` Worker** from Workers & Pages
2. **Keep the KV namespace** - it's now used by Pages

#### 4.4 Update Documentation

Update `CLAUDE.md` to reflect the new architecture:
- Remove references to separate Worker
- Update deployment instructions
- Document KV binding requirements

---

## Deployment Configuration

### Cloudflare Pages Build Settings

| Setting | Value |
|---------|-------|
| **Build command** | `npm run pages:build` |
| **Deploy command** | `npx wrangler pages deploy .vercel/output/static` |
| **Build output directory** | `.vercel/output/static` |
| **Root directory** | `/` |

### Required Secrets/Variables

| Name | Type | Description |
|------|------|-------------|
| `TOGETHER_API_KEY` | Secret | API key for Together.ai |
| `CLOUDFLARE_API_TOKEN` | Secret | For wrangler deployment (needs Pages Edit permission) |

---

## Testing Plan

### Local Testing

```bash
# Start local dev with KV emulation
npm run pages:dev
```

### Verify:
1. [ ] Assessment works without cache (first request)
2. [ ] Assessment returns cached result (second identical request)
3. [ ] Different translations create different cache entries
4. [ ] Cache miss falls back to LLM correctly

### Production Testing

After deployment:
1. [ ] Visit https://versemadeeasy.com
2. [ ] Navigate to a verse practice page
3. [ ] Submit a translation
4. [ ] Verify feedback is returned
5. [ ] Submit same translation again - should be faster (cached)
6. [ ] Check Cloudflare dashboard for KV activity

---

## Rollback Plan

If issues arise after deployment:

1. **Revert the branch**: `git revert` the merge commit
2. **Redeploy**: Push to trigger new Pages deployment
3. **Re-enable Worker**: If needed, the worker code is in git history

The KV cache data remains intact regardless of which service reads it.

---

## Migration Checklist

- [ ] Create `src/lib/cache.ts`
- [ ] Update `src/app/api/assess-translation/route.ts`
- [ ] Create `src/types/cloudflare.d.ts`
- [ ] Update `wrangler.toml` with KV binding
- [ ] Update `VersePracticeClient.tsx` to remove API_URL logic
- [ ] Add `TOGETHER_API_KEY` to Pages environment variables
- [ ] Add KV namespace binding in Pages dashboard
- [ ] Test locally with `npm run pages:dev`
- [ ] Deploy and verify
- [ ] Delete `worker/` directory
- [ ] Remove worker scripts from `package.json`
- [ ] Delete `qalam-api` Worker from Cloudflare dashboard
- [ ] Update `CLAUDE.md` documentation

---

## Timeline

This is a focused refactoring task. All changes can be made in a single PR once the plan is approved.

**Dependencies:**
- Cloudflare Pages dashboard access
- `TOGETHER_API_KEY` available
- KV namespace ID confirmed

---

## Questions to Resolve

1. Should we keep the worker code in a `worker-archive/` folder for reference, or delete completely?
2. Do we need to update any external documentation or links that point to the worker URL?
3. Is there any monitoring/alerting set up for the worker that needs to be migrated?
