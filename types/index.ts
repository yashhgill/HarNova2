export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  token_balance: number
  github_token: string | null
  created_at: string
}

export type SiteStatus = 'draft' | 'building' | 'deployed' | 'expired' | 'error'

export type Site = {
  id: string
  user_id: string
  name: string
  description: string | null
  subdomain: string
  custom_domain: string | null
  html: string
  files: Record<string, string> | null   // filename → content for multi-file apps
  site_type: SiteType
  status: SiteStatus
  deployed_url: string | null
  vercel_project_id: string | null
  deploy_expires_at: string | null       // null = permanent
  github_repo: string | null
  created_at: string
  updated_at: string
}

export type SiteType = 'landing' | 'portfolio' | 'ecommerce' | 'restaurant' | 'fullstack' | 'saas'

export type TokenTransaction = {
  id: string
  user_id: string
  amount: number                         // positive = credit, negative = debit
  type: 'purchase' | 'spend' | 'refund' | 'bonus'
  description: string
  stripe_payment_intent: string | null
  created_at: string
}

export type TokenPack = {
  id: string
  tokens: number
  price_usd: number
  price_id: string
  label: string
  popular?: boolean
}

export const TOKEN_PACKS: TokenPack[] = [
  { id: 'starter', tokens: 100, price_usd: 15, price_id: process.env.STRIPE_PRICE_100 ?? '', label: 'Starter' },
  { id: 'builder', tokens: 200, price_usd: 30, price_id: process.env.STRIPE_PRICE_200 ?? '', label: 'Builder', popular: true },
  { id: 'pro',     tokens: 500, price_usd: 60, price_id: process.env.STRIPE_PRICE_500 ?? '', label: 'Pro' },
]

export const TOKEN_COSTS = {
  generate:          10,   // generate a new site
  regenerate:         5,   // tweak / regenerate
  deploy_trial:       5,   // deploy with 2-day subdomain
  deploy_permanent:  20,   // permanent harnova subdomain
  deploy_monthly:    10,   // monthly hosting renewal
  custom_domain:     50,   // buy domain (per year)
  github_push:        5,   // push to GitHub repo
  download:           0,   // download ZIP (free)
} as const
