---
name: awesome-design-md
description: >-
  Look up and apply production-grade design systems and UI/UX guidelines from top companies
  (Linear, Stripe, Apple, Vercel, Supabase, Figma, Raycast, Nike, Tesla, etc.).
  Use when designing pages, components, color palettes, typography, spacing, or animation.
---

# Awesome Design.md — Enterprise Design Systems

This skill allows the agent to reference the exact design guidelines, color palettes, typography, border radiuses, component styling, and motion language from 75+ leading tech and design-forward companies.

## Available Design Systems

All design systems are located in `.agents/design-systems/`:

| Category | Available Companies |
|---|---|
| **Clean / Modern SaaS** | `linear.app`, `stripe`, `vercel`, `supabase`, `raycast`, `figma`, `resend`, `posthog` |
| **Enterprise & DevTools** | `hashicorp`, `mongodb`, `sentry`, `clickhouse`, `docker`, `github` |
| **Consumer & Premium** | `apple`, `airbnb`, `tesla`, `nike`, `superhuman`, `spotify`, `starbucks` |
| **Fintech & Web3** | `coinbase`, `revolut`, `wise`, `binance` |
| **AI & Next-Gen** | `claude`, `minimax`, `mistral.ai`, `x.ai`, `runwayml`, `cohere` |

## How to Apply a Design System

1. Identify the target aesthetic for the feature (for BPTI, clean enterprise SaaS like Linear/Vercel/Stripe works best).
2. Open the corresponding design file:
   `.agents/design-systems/<company>/DESIGN.md`
3. Extract:
   - Color variables and dark mode tokens
   - Typography scales and font pairings
   - Spacing, padding, and layout grid
   - Border radius and subtle border contrast (e.g. 1px borders with subtle alpha)
   - Micro-animations and transition timings
4. Apply these tokens into the project's CSS / Tailwind configuration.
