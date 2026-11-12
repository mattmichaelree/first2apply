# Fork Checklist

## Goal

Get the inherited discovery engine running under our branding and infrastructure as fast as possible, then build our own intelligence layer on top.

## Phase 1: Identity

- [ ] Create a new repo/org for the fork
- [ ] Define final product name
- [ ] Define package scope
- [ ] Define custom desktop protocol
- [ ] Define primary domain
- [ ] Define Windows app ID
- [ ] Define macOS bundle ID
- [ ] Search and replace legacy identity strings:
  - [ ] `first2apply`
  - [ ] `First 2 Apply`
  - [ ] `@first2apply`
  - [ ] `first2apply://`
  - [ ] `first2apply.com`

## Phase 2: Desktop Rebrand

- [ ] Update root package metadata
- [ ] Update desktop app package metadata
- [ ] Update desktop app protocol constant
- [ ] Update desktop packaging config
- [ ] Replace desktop app icons/assets
- [ ] Audit deep-link handling
- [ ] Audit auto-update configuration
- [ ] Audit billing configuration

## Phase 3: Backend / Infra

- [ ] Create a fresh Supabase project
- [ ] Apply database schema
- [ ] Import job-site seed data
- [ ] Review and prune unsupported job sites
- [ ] Create local env files
- [ ] Wire Supabase URL and keys
- [ ] Wire AI provider credentials
- [ ] Wire or disable billing
- [ ] Wire analytics and email later if needed

## Phase 4: Baseline Validation

- [ ] Verify sign-up/login works
- [ ] Verify saved-link creation works
- [ ] Verify list-page scraping works
- [ ] Verify jobs persist to backend
- [ ] Verify job-description scraping works
- [ ] Verify jobs render in the desktop UI
- [ ] Verify filter settings save/load
- [ ] Verify desktop build/package works

## Phase 5: Scope Reduction

- [ ] Remove blog from active scope
- [ ] Remove invoice tooling from active scope
- [ ] Remove unrelated backend utilities from active scope
- [ ] Decide whether landing page remains in scope
- [ ] Decide whether web companion remains in scope

## Phase 6: Tag the Baseline

- [ ] Tag or mark the repo state as `acquired core baseline`
- [ ] Treat this as the last point where inherited core is the main focus

## Phase 7: Extension Layer

- [ ] Add new schema file for custom product features
- [ ] Add tables for enrichment
- [ ] Add tables for scoring
- [ ] Add tables for filter decisions
- [ ] Add tables for user search profiles
- [ ] Add tables for user filter rules
- [ ] Extend shared types
- [ ] Extend shared SDK/API seams
- [ ] Keep inherited scrape/parse core stable while doing this

## Phase 8: Build the Moat

- [ ] Implement v1 ranking
- [ ] Implement v1 filtering
- [ ] Implement explanations
- [ ] Replace inherited filters UX
- [ ] Decide on shared corpus architecture before implementation

## Rules

- Keep inherited scrape/parse flow stable first
- Do not rewrite unrelated systems too early
- Separate inherited-core work from new-moat work
- Avoid overloading inherited per-user job tables with shared-corpus responsibilities
- Focus on practical user value, not novelty

## Helpful Docs

- `CONTRIBUTING.md`
- `WORKFLOW.md`
- `docs/notion-pack/`
- `docs/ops-pack/`
