# Intelligence Implementation Sequence

## Purpose

Give the team a clear order for turning the current additive intelligence schema and types into real product behavior.

## Phase 1: Data Foundations

Complete first:

- apply `apps/backend/supabase/extensions/001_intelligence_layer.sql`
- confirm policies work for the current user model
- expose the new types through `@first2apply/core`

Done/prepared already:

- additive SQL exists
- additive core types exist
- additive intelligence SDK types exist

## Phase 2: Client API Layer

Add to `F2aSupabaseApi`:

- profile CRUD for `user_search_profiles`
- rules CRUD for `user_filter_rules`
- read methods for `job_enrichments`
- read methods for `job_scores`
- read methods for `job_filter_decisions`

Goal:

- prove the new data model can be read and written from the current app shells

## Phase 3: First Intelligence Assembly

Implement a simple read path that can produce:

- base job
- enrichment
- score
- filter decision
- explanation

This can start as:

- one job at a time
- or a thin ranked list query

It does not need to be a perfect ranking engine yet.

## Phase 4: First Product UX

Add UI for:

- search profile settings
- user filter rules
- explanation display
- ranked job list experiments

Keep inherited job flows working during this phase.

## Phase 5: Real Ranking / Filtering Logic

Once reads/writes exist, implement:

- score generation
- decision generation
- explanation assembly
- strict/balanced/broad behavior

This is where your real moat starts to become user-visible.

## Suggested Rule

Do not jump from schema design straight to polished ranking UX.

Build in this order:

1. write path
2. read path
3. explanation path
4. first UI
5. smarter logic

## Exit Condition

This sequence is complete when a user can:

- define search preferences
- apply filter rules
- see ranked jobs
- understand why a job is shown, hidden, or prioritized
