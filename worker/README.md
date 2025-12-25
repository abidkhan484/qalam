# Qalam Assessment API Worker

Cloudflare Worker for translation assessment with KV caching.

## Setup

1. Install dependencies:
   ```bash
   cd worker
   npm install
   ```

2. Create KV namespace:
   ```bash
   npm run kv:create
   # Copy the ID to wrangler.toml

   npm run kv:create:preview
   # Copy the preview ID to wrangler.toml
   ```

3. Set secrets:
   ```bash
   wrangler secret put TOGETHER_API_KEY
   # Enter your Together.ai API key when prompted
   ```

4. Update `wrangler.toml` with your KV namespace IDs.

## Development

```bash
# Run locally (uses Together.ai by default)
npm run dev

# Run locally with local vLLM
npm run dev:local
```

The Worker runs at `http://localhost:8787` by default.

## Deployment

```bash
# Deploy to Cloudflare
npm run deploy

# View logs
npm run tail
```

## Endpoints

### POST /assess

Assess a user's translation.

**Request:**
```json
{
  "verseId": "1:1",
  "userTranslation": "In the name of God, the most gracious..."
}
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "feedback": {
      "overallScore": 0.85,
      "correctElements": ["..."],
      "missedElements": ["..."],
      "suggestions": ["..."],
      "encouragement": "..."
    }
  }
}
```

### GET /health

Health check endpoint.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ASSESSMENT_BACKEND` | LLM backend: `together`, `vllm`, `ollama` | `together` |
| `TOGETHER_API_KEY` | Together.ai API key (secret) | - |
| `TOGETHER_MODEL` | Together.ai model | `meta-llama/Llama-3.3-70B-Instruct-Turbo` |
| `VLLM_BASE_URL` | vLLM server URL | `http://localhost:8000` |
| `VLLM_MODEL` | vLLM model name | `Qwen/Qwen3-4B-Instruct` |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | `https://qalam.pages.dev,http://localhost:3000` |

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Static Site    │────▶│  Worker API      │────▶│  LLM API    │
│  (Pages)        │     │  /assess         │     │  (Together) │
└─────────────────┘     └────────┬─────────┘     └─────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  KV Cache        │
                        │  (30 day TTL)    │
                        └──────────────────┘
```

The Worker fetches verse data from the static site (`qalam.pages.dev/data/`) and caches assessment results in KV to avoid repeated LLM calls for the same translation.
