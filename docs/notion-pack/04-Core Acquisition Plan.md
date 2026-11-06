# Core Acquisition Plan

## Purpose

We are using the inherited scraper/parser codebase as a `core acquisition` to accelerate discovery infrastructure, not as the final product architecture.

## What We Are Keeping

- Desktop app shell
- Local browser-based scraping
- Retry/backoff/concurrency model
- Saved-link scanning flow
- Job list parsing flow
- Job description parsing flow
- Shared types and SDK scaffolding
- Supabase-based persistence as the starting point

## What We Are Not Keeping As Final

- Product branding
- Product identity
- Inherited UX as the long-term interface
- Advanced matching as the long-term intelligence layer
- Billing/marketing/blog surfaces as strategic assets
- Current architecture as the final system design
- Existing parser durability assumptions
- Existing policy/trust assumptions

## Execution Plan

### Phase 1

- Fork and rebrand
- Stand up our infrastructure
- Get inherited end-to-end flow working
- Tag `acquired core baseline`

### Phase 2

- Add new schema/API seams for enrichment, scoring, and filtering
- Keep inherited scrape/parse core stable
- Introduce custom logic in parallel

### Phase 3

- Build ranking and filtering moat
- Replace inherited UX where needed
- Decide whether to support shared corpus ingestion

## Scope Rules

- Do not rewrite unrelated systems too early
- Do not optimize blog/marketing surfaces early
- Do not overload inherited per-user jobs model if a shared corpus is introduced
- Do not assume inherited advanced matching is strategic
- Distinguish inherited-core work from new-moat work

## Success Criteria

- Inherited discovery engine runs under our brand and infrastructure
- We have a stable baseline before building differentiation
- The codebase has clean seams for future ranking/filtering work
