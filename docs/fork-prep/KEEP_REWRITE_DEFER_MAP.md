# Keep Rewrite Defer Map

## Purpose

This document classifies major repo areas into:

- Keep now
- Rewrite later
- Defer / ignore

## Keep Now

These are core acquisition assets and should stay the focus of early work.

### Desktop discovery engine

- `/apps/desktopProbe/src/server/htmlDownloader.ts`
- `/apps/desktopProbe/src/server/jobScanner.ts`
- `/apps/desktopProbe/src/server/workerQueue.ts`
- `/apps/desktopProbe/src/server/helpers.ts`
- `/apps/desktopProbe/src/index.ts`

### Backend parse pipeline

- `/apps/backend/supabase/functions/create-link/index.ts`
- `/apps/backend/supabase/functions/scan-urls/index.ts`
- `/apps/backend/supabase/functions/scan-job-description/index.ts`
- `/apps/backend/supabase/functions/_shared/jobListParser.ts`
- `/apps/backend/supabase/functions/_shared/jobDescriptionParser.ts`
- `/apps/backend/supabase/functions/_shared/parsers/*`

### Shared contract layer

- `/libraries/core/*`
- `/libraries/ui/*`

### Base schema and seed data

- `/apps/backend/supabase/seed.sql`
- `/apps/backend/supabase/sites_rows.csv`

## Rewrite Later

These are useful as temporary scaffolding but should not become the final product layer.

### Product-facing filtering

- `/apps/desktopProbe/src/pages/filters.tsx`
- `/apps/backend/supabase/functions/_shared/advancedMatching.ts`

### Billing/product packaging assumptions

- `/apps/desktopProbe/src/server/stripeConfig.ts`
- `/apps/backend/supabase/functions/handle-stripe-webhook/index.ts`

### Landing/product marketing surfaces

- `/apps/landingPage/*`
- `/apps/webapp/*`

### Custom parsing intelligence

- `/apps/backend/supabase/functions/_shared/customJobsParser.ts`

## Defer / Ignore

These should not consume early project energy.

### Content / SEO

- `/apps/blog/*`
- `/docs/seoPlan.md`
- `/docs/content_calendar.md`

### Internal utility apps

- `/apps/invoiceDownloader/*`
- `/apps/nodeBackend/*`

### Historical release notes

- `/CHANGELOG.md`

## Rule of Thumb

### Keep now if it directly helps:

- scraping
- parsing
- persistence
- desktop baseline validation

### Rewrite later if it is:

- user-facing product logic
- temporary product UX
- inherited monetization assumptions

### Defer if it is:

- content
- marketing ops
- side tooling
- anything not on the critical path to baseline + moat
