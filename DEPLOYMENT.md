# Deployment Guide — USPTO Patent Filing Assistant

## Prerequisites
- Node 20+, npm 10+
- Vercel account (vercel.com)
- Anthropic API key (console.anthropic.com)

## Local Development

```bash
git clone https://github.com/GF-Accelerate/uspto-filing-assistant.git
cd uspto-filing-assistant
npm install
cp .env.example .env
# Edit .env: set VITE_ANTHROPIC_API_KEY=sk-ant-...
npm run dev
# Open http://localhost:5173
```

## Vercel Deployment (Recommended)

### Option A — Vercel Dashboard (easiest)
1. Go to vercel.com/new
2. Import repo: GF-Accelerate/uspto-filing-assistant
3. Framework: **Vite** (auto-detected)
4. Add environment variable: `VITE_ANTHROPIC_API_KEY` = your key
5. Click **Deploy**

### Option B — Vercel CLI
```bash
npm install -g vercel
vercel login
cd uspto-filing-assistant
vercel --prod
# Follow prompts, set env vars when asked
```

### Option C — GitHub Actions (CI/CD auto-deploy)
Every push to `main` auto-deploys via the Vercel GitHub integration.
Connect at: vercel.com/dashboard → Settings → Git Integration

## Environment Variables (Vercel Dashboard)

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-...` | ✅ Yes |
| `VITE_APP_VERSION` | `1.0.0` | No |
| `VITE_ENVIRONMENT` | `production` | No |

## Build Details

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20.x |
| Install command | `npm install` |

## Security Notes
- The Anthropic API key is exposed to the browser (VITE_ prefix)
- For production: consider a proxy API route to keep the key server-side
- All USPTO filing still requires the user's own ID.me + MFA authentication
