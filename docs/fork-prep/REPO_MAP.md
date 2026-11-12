# Repo Map

## Purpose

This page gives a fast orientation to the repo and explains which folders matter most for the fork.

## Top Level

### `/apps`

Contains product surfaces and utility applications.

### `/libraries`

Contains shared code used across apps.

### `/docs`

Contains strategy and prep docs.

### `/.github`

Contains workflows and templates.

### `/other`

Contains supporting assets such as icons and email templates.

## Apps

### `/apps/desktopProbe`

The most important app for the fork.

Why it matters:

- desktop shell
- local scraping
- scan orchestration
- user-facing discovery experience

Key areas:

- `src/index.ts`
- `src/server/*`
- `src/pages/*`
- `forge.config.ts`

### `/apps/backend`

The second most important app for the fork.

Why it matters:

- Supabase config
- edge functions
- parser pipeline
- base schema
- seeded site definitions

Key areas:

- `supabase/seed.sql`
- `supabase/config.toml`
- `supabase/sites_rows.csv`
- `supabase/functions/*`

### `/apps/webapp`

Companion web app.

Why it matters:

- useful if you want a lightweight browser-based companion
- not required for the inherited desktop baseline

### `/apps/landingPage`

Marketing surface.

Why it matters:

- public-facing copy and download links
- not critical for baseline validation

### `/apps/blog`

Content surface.

Why it matters:

- low priority for the fork
- safe to ignore early

### `/apps/invoiceDownloader`

Utility app.

Why it matters:

- not on the critical path

### `/apps/nodeBackend`

Utility/backend script app.

Why it matters:

- not on the critical path for the fork baseline

## Libraries

### `/libraries/core`

Shared domain types and contracts.

Why it matters:

- this is where you should evolve shared data contracts carefully
- important for future ranking/filtering/scoring types

### `/libraries/ui`

Shared UI components and API wrapper layer.

Why it matters:

- central place for shared client-side integration behavior
- good extension seam for new APIs

## Docs

### `/docs/fork-prep`

Operational prep for the fork.

### `/docs/notion-pack`

Import-ready Notion pages.

### `/docs/ops-pack`

Linear/GitHub operating templates.

## High-Priority Files

These are the first files to understand for the fork:

- `/FORK_CHECKLIST.md`
- `/CONTRIBUTING.md`
- `/WORKFLOW.md`
- `/apps/desktopProbe/src/index.ts`
- `/apps/desktopProbe/src/server/jobScanner.ts`
- `/apps/desktopProbe/src/server/htmlDownloader.ts`
- `/apps/backend/supabase/seed.sql`
- `/apps/backend/supabase/config.toml`
- `/apps/backend/supabase/functions/scan-urls/index.ts`
- `/apps/backend/supabase/functions/scan-job-description/index.ts`
- `/apps/backend/supabase/functions/_shared/jobListParser.ts`
- `/apps/backend/supabase/functions/_shared/jobDescriptionParser.ts`
- `/libraries/core/src/types.ts`
- `/libraries/ui/src/lib/supabaseApi.ts`

## Early-Fork Rule

If a folder does not help with:

- scraping
- parsing
- persistence
- baseline validation
- extension seams

it should not dominate early attention.
