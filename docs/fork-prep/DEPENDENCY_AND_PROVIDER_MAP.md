# Dependency and Provider Map

## Purpose

This document maps the main external services used by the inherited codebase and classifies them by fork priority.

## Provider Categories

- Required for baseline
- Replace or stub for baseline
- Safe to defer

## 1. Supabase

### Purpose

- auth
- database
- edge functions
- main persistence layer

### Where It Appears

- `/apps/desktopProbe/.env.example`
- `/apps/backend/supabase/config.toml`
- `/apps/backend/supabase/functions/_shared/env.ts`
- `/apps/webapp/src/lib/supabase/*`
- `/libraries/ui/src/lib/supabaseApi.ts`

### Fork Priority

`Required for baseline`

### Notes

This is the most important dependency to replace first. The inherited product does not function meaningfully without it.

## 2. Azure OpenAI / AI Foundry

### Purpose

- advanced matching
- custom parser intelligence
- AI usage logging

### Where It Appears

- `/apps/backend/supabase/functions/.env.example`
- `/apps/backend/supabase/functions/_shared/openAI.ts`
- `/apps/backend/supabase/functions/_shared/advancedMatching.ts`
- `/apps/backend/supabase/functions/_shared/customJobsParser.ts`

### Fork Priority

`Replace or stub for baseline`

### Notes

If advanced matching is not critical to the baseline fork, this can be configured later or kept minimally working.

## 3. Stripe

### Purpose

- subscriptions
- billing events
- customer/subscription metadata

### Where It Appears

- `/apps/backend/supabase/functions/.env.example`
- `/apps/backend/supabase/functions/handle-stripe-webhook/index.ts`
- `/apps/backend/supabase/seed.sql`
- `/apps/desktopProbe/src/server/stripeConfig.ts`

### Fork Priority

`Replace or stub for baseline`

### Notes

Billing does not need to be production-ready to validate the inherited scrape/parse engine. Safe to stub early if needed.

## 4. MailerSend

### Purpose

- outgoing email alerts
- broken-link notifications

### Where It Appears

- `/apps/backend/supabase/functions/.env.example`
- `/apps/backend/supabase/functions/post-scan-hook/index.ts`
- `/apps/backend/supabase/functions/_shared/emails/mailer.ts`

### Fork Priority

`Replace or stub for baseline`

### Notes

Useful for product completeness, but not required to validate collection and parsing.

## 5. MailerLite

### Purpose

- email marketing / lifecycle sync
- subscriber group updates on profile changes

### Where It Appears

- `/apps/backend/supabase/functions/.env.example`
- `/apps/backend/supabase/functions/handle-profile-change-webhook/index.ts`
- `/apps/backend/supabase/functions/_shared/mailerLiteApi.ts`

### Fork Priority

`Safe to defer`

### Notes

This is not required for discovery-engine validation.

## 6. Amplitude

### Purpose

- product analytics from desktop app

### Where It Appears

- `/apps/desktopProbe/.env.example`
- `/apps/desktopProbe/src/server/amplitude.ts`
- desktop release workflows

### Fork Priority

`Safe to defer`

### Notes

Can be left disabled initially if no API key is provided.

## 7. Mezmo / LogDNA

### Purpose

- backend logging
- desktop logging

### Where It Appears

- `/apps/desktopProbe/.env.example`
- `/apps/backend/supabase/functions/.env.example`
- `/apps/desktopProbe/src/server/logger.ts`
- `/apps/backend/supabase/functions/_shared/logger.ts`

### Fork Priority

`Safe to defer`

### Notes

Useful for production visibility, but can be stubbed or replaced later.

## 8. Apple Signing / Team Credentials

### Purpose

- macOS signing and packaging

### Where It Appears

- `/apps/desktopProbe/.env.example`
- `/apps/desktopProbe/forge.config.ts`
- macOS release workflow

### Fork Priority

`Safe to defer unless macOS packaging is required immediately`

### Notes

Not needed for local validation.

## 9. Release Hosting / S3

### Purpose

- release artifacts
- auto-update feeds

### Where It Appears

- `/.github/workflows/linux-release.yml`
- `/.github/workflows/macos-release.yml`
- `/.github/workflows/ms-store-release.yml`
- landing page download links

### Fork Priority

`Replace or stub for baseline`

### Notes

Not required to validate the local inherited baseline, but important before external testing or distribution.

## Baseline Recommendation

To get the fork running as fast as possible:

### Must set up

- Supabase

### Should stub or minimally wire

- AI provider
- Stripe
- release hosting

### Can safely defer

- MailerLite
- Amplitude
- Mezmo
- Apple signing

## Suggested Order

1. Supabase
2. protocol / package identity
3. baseline desktop + backend validation
4. AI provider
5. Stripe
6. release hosting
7. analytics/logging/email lifecycle
