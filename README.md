# HarNova — AI Website Builder for Malaysian SMEs

Sign up, buy tokens, describe your business, and Claude AI builds you a complete website. Deploy to a free subdomain, go permanent, push to GitHub, or download the code. Built for solo operators and small businesses across Malaysia.

**Live:** [harnova.my](https://harnova.my)
**Contact:** [WhatsApp +60 18-208 5097](https://wa.me/60182085097)

---

## How it works

1. **Sign up** → 10 free tokens land instantly.
2. **Describe your business** in the builder → Claude (Anthropic) generates a complete, production-ready website.
3. **Preview, tweak, regenerate** as needed.
4. **Deploy**:
   - 2-day free trial on a `*.harnova.my` subdomain (5 tokens)
   - Permanent subdomain (20 tokens, then 10 tokens/month)
   - Custom domain (50 tokens/year, via Namecheap — coming soon)
5. **Own your code** — download the ZIP anytime for free, or push to your own GitHub repo (5 tokens).

## Token economics

| Action | Cost |
|---|---|
| Generate website | 10 tokens |
| Regenerate / tweak | 5 tokens |
| Deploy (2-day trial) | 5 tokens |
| Permanent deploy | 20 tokens |
| Hosting renewal | 10 tokens/month |
| Custom domain | 50 tokens/year |
| GitHub push | 5 tokens |
| Download ZIP | Free |

| Pack | Tokens | Price |
|---|---|---|
| Starter | 100 | $15 |
| Builder | 200 | $30 |
| Pro | 500 | $60 |

## Tech stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Auth + DB:** Supabase (Postgres, RLS, Auth)
- **AI:** Claude (Anthropic API) — `claude-sonnet-4-6`
- **Payments:** Stripe Checkout
- **Hosting (user sites):** Vercel API
- **Source control integration:** GitHub REST API

## Project structure

```
app/
  page.tsx                  marketing homepage
  auth/                     login, signup, callback
  dashboard/                overview, sites, billing, settings
  builder/                  the core AI builder UI
  api/
    ai/generate/             Claude generation endpoint
    sites/save, deploy/      save + deploy logic
    github/connect/          GitHub push endpoint
    stripe/checkout/         Stripe session creation
    webhooks/stripe/         Stripe webhook (token fulfilment)
lib/
  supabase/                 client + server Supabase helpers
  tokens.ts                 token deduction/addition logic
  stripe.ts                 Stripe client
  vercel.ts                 Vercel deploy API wrapper
  utils.ts                  shared helpers
supabase/migrations/        SQL schema (run in Supabase SQL editor)
```

## Setup

### 1. Clone and install
```bash
git clone https://github.com/yashhgill/HarNova2.git
cd HarNova2
npm install
```

### 2. Set up Supabase
- Create a project at [supabase.com](https://supabase.com)
- Run `supabase/migrations/001_init.sql` in the SQL Editor
- Copy your project URL and keys into `.env.local`

### 3. Get a Claude API key
- [console.anthropic.com](https://console.anthropic.com) → API Keys

### 4. Set up Stripe (optional, for payments)
- [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys
- Create a webhook endpoint pointing to `/api/webhooks/stripe` listening for `checkout.session.completed`

### 5. Set up Vercel deploy API (optional, for hosting)
- [vercel.com/account/tokens](https://vercel.com/account/tokens) → create token

### 6. Fill in `.env.local`
```bash
cp .env.example .env.local
# fill in your keys
```

### 7. Run locally
```bash
npm run dev
# open http://localhost:3000
```

### 8. Deploy
```bash
npm install -g vercel
vercel
# add all env vars in the Vercel dashboard, then point harnova.my's DNS at Vercel
```

## License

© 2025 HarNova. All rights reserved.
