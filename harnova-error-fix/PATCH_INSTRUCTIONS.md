# Patch: friendly AI errors + no-charge-on-failure

## Files changed
1. `app/api/ai/generate/route.ts` — full replacement
2. `lib/tokens.ts` — full replacement (added getBalance export)

## What changed
- Claude is now called BEFORE tokens are deducted. If generation fails for any reason
  (no credits, rate limit, overload, etc), the customer is NOT charged.
- Raw Anthropic API error JSON is never shown to the customer. Instead:
  - Low credit balance on YOUR Anthropic account → "high demand, try again shortly"
  - Rate limited (429) → "try again in about a minute"
  - Overloaded (529/503) → "temporarily overloaded, try again"
  - Anything else → generic friendly retry message
- Insufficient customer tokens is checked up front (before calling Claude) so we don't
  waste an API call on a request that can't be paid for anyway.

## How to apply
Copy these two files into your HarNova2 repo, overwriting the existing ones at the same paths:
  app/api/ai/generate/route.ts
  lib/tokens.ts

Then commit and push as usual.
