# Local Development Setup

After merging the consolidation PR, follow these steps to set up your local development environment.

## Prerequisites

1. **Wrangler CLI authenticated**
   ```bash
   npx wrangler login
   ```

2. **Cloudflare account with:**
   - Workers enabled (free tier)
   - R2 enabled (free tier)
   - KV namespace already exists (from previous setup)

## Step 1: Create R2 Bucket

```bash
# Create production bucket
npx wrangler r2 bucket create qalam-data

# Create preview bucket (for local dev)
npx wrangler r2 bucket create qalam-data-preview

# Verify
npx wrangler r2 bucket list
```

## Step 2: Upload Data to R2

```bash
# Initial full upload (run once)
npm run upload:r2

# For subsequent updates (delta sync)
npm run sync:r2

# Check progress
npm run data:status
```

## Step 3: Set Worker Secrets

```bash
cd worker

# Set Together.ai API key for LLM
npx wrangler secret put TOGETHER_API_KEY
# (paste your API key when prompted)
```

## Step 4: Local Development

**Terminal 1 - Worker:**
```bash
npm run worker:dev
# Runs at http://localhost:8787
```

**Terminal 2 - Next.js:**
```bash
npm run dev
# Runs at http://localhost:3000
```

For local dev, create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## Step 5: Deploy

**Deploy Worker:**
```bash
npm run worker:deploy
```

**Deploy Pages:**
Push to `main` branch - GitHub Actions will build and deploy automatically.

Or manually:
```bash
npm run build
npx wrangler pages deploy out --project-name=qalam
```

## Step 6: GitHub Actions Setup

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Workers/Pages permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

To create an API token:
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create token with:
   - `Workers Scripts:Edit`
   - `Pages:Edit`
   - `Account:Read`

---

## Troubleshooting

### Worker can't access R2
- Verify bucket exists: `npx wrangler r2 bucket list`
- Check binding name in `worker/wrangler.toml` matches code

### CORS errors
- Check `ALLOWED_ORIGINS` in `worker/wrangler.toml`
- Add your local/preview URLs if needed

### Assessment not working
- Verify `TOGETHER_API_KEY` is set: `npx wrangler secret list`
- Check Worker logs: `npx wrangler tail`

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run worker:dev` | Start Worker locally |
| `npm run build` | Build static export |
| `npm run start` | Serve static build |
| `npm run upload:r2` | Upload all data to R2 |
| `npm run sync:r2` | Sync new analysis files |
| `npm run data:status` | Show generation progress |
| `npm run worker:deploy` | Deploy Worker |
