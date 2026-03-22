# How to Deploy FamilyMind to Production

## Prerequisites

- Node.js 20+
- A PostgreSQL database (Neon recommended — already in use)
- A Clerk account with a production instance
- A Stripe account with a product/price configured

## Environment Variables

### Required — set by Asif

| Variable | Source | Status |
|----------|--------|--------|
| `DATABASE_URL` | Neon dashboard | Already configured |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys (sk_live_...) | **Needs Asif** |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys (pk_live_...) | **Needs Asif** |
| `STRIPE_SECRET_KEY` | Stripe dashboard → API Keys (sk_live_...) | **Needs Asif** |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks (whsec_...) | **Needs Asif** |
| `VITE_STRIPE_PRICE_ID` | Stripe dashboard → Products → Price ID (price_...) | **Needs Asif** |

### Required — already set or auto-configured

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Set by hosting platform |
| `PORT` | `5000` (or platform default) | Most platforms auto-assign |

### Optional

| Variable | Purpose | Default |
|----------|---------|---------|
| `OPENAI_API_KEY` | AI assistant, grocery predictions, schedule conflicts | AI features silently disabled |
| `SENDGRID_API_KEY` | Invitation/notification emails | Email features disabled |
| `SENDGRID_FROM_EMAIL` | Sender address for emails | `noreply@familymind.app` |

## Deploy Steps

### Option A: Railway / Render (Recommended)

Best for this app — supports WebSocket (real-time collaboration), persistent process, and simple setup.

**Railway:**
1. Connect the GitHub repo at [railway.app](https://railway.app)
2. Railway auto-detects Node.js. Set build command: `npm run build`
3. Set start command: `npm run start`
4. Add environment variables (see table above)
5. Deploy — Railway assigns a public URL automatically

**Render:**
1. Create a new Web Service at [render.com](https://render.com)
2. Connect the GitHub repo
3. Build command: `npm ci && npm run build`
4. Start command: `npm run start`
5. Add environment variables
6. Deploy

### Option B: Vercel

Works for the core app. WebSocket-based real-time collaboration (N-13) will not function — Vercel serverless functions are stateless. All other features work.

1. Connect the GitHub repo at [vercel.com](https://vercel.com)
2. Framework preset: "Other"
3. Build command: `npm run build` (auto-detected from vercel.json)
4. Output directory: `dist/public` (auto-detected)
5. Add environment variables
6. Deploy

**Note:** The API runs as a full Express server in `dist/index.js`. For Vercel, you may need to create a serverless wrapper in `api/` — see Vercel docs for Express adaptation.

### Option C: Any VPS / Docker

```bash
git clone <repo-url> && cd familymind
npm ci
npm run build
NODE_ENV=production PORT=5000 node dist/index.js
```

## Post-Deploy Checklist

1. **Verify health:** `curl https://your-domain.com/api/health` → should return `{"status":"ok",...}`
2. **Verify Clerk:** Visit the app → Clerk sign-in should appear
3. **Verify Stripe:** Go to `/premium` → click upgrade → Stripe Checkout should open
4. **Set up Stripe webhook:**
   - In Stripe dashboard → Webhooks → Add endpoint
   - URL: `https://your-domain.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET`
5. **Verify database:** Sign in → sample data should appear (seeded on first login)
6. **Test premium flow:** Create account → upgrade → verify AI features unlock

## Architecture Notes

- Single Express server serves both API (`/api/*`) and client (SPA with fallback)
- Build output: `dist/index.js` (server) + `dist/public/` (client assets)
- Database: Neon PostgreSQL via `@neondatabase/serverless` (WebSocket transport)
- Auth: Clerk (server: `@clerk/express`, client: `@clerk/react`)
- Billing: Stripe Checkout + webhooks for subscription management
- AI: OpenAI GPT-4o — premium-only, silently disabled without API key
