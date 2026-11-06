# Supabase API Extension Plan

## Purpose

Define how the inherited `F2aSupabaseApi` client should grow into the new intelligence layer without forcing a risky rewrite.

## Current State

Today, `libraries/ui/src/lib/supabaseApi.ts` is the shared client wrapper around:

- auth
- links
- jobs
- sites
- notes
- reviews
- advanced matching

It is effectively the main client-side seam into the inherited backend.

## Recommended Approach

Keep the inherited API stable.

Add intelligence methods in parallel.

Do not refactor the whole class around the new product model in the same step as the fork/rebrand.

## Near-Term Pattern

Use this sequence:

1. keep `First2ApplyApiSdk` working as-is
2. add additive intelligence types in `@first2apply/core`
3. add intelligence methods to `F2aSupabaseApi` only when the backing tables/queries exist
4. move UI consumers gradually from raw `listJobs` assumptions to ranked/intelligence-aware views

## Recommended Methods To Add Later

When the intelligence tables are active, add methods like:

- `getUserSearchProfile`
- `upsertUserSearchProfile`
- `listUserFilterRules`
- `upsertUserFilterRule`
- `deleteUserFilterRule`
- `listRankedJobs`
- `getJobIntelligence`

These already have additive types in:

- `libraries/core/src/intelligence.ts`
- `libraries/core/src/intelligence-sdk.ts`

## Query Strategy

Prefer simple Supabase table reads/writes first.

Examples:

- `user_search_profiles`
- `user_filter_rules`
- `job_enrichments`
- `job_scores`
- `job_filter_decisions`

If ranked job retrieval becomes too awkward as multiple client-side queries, then add:

- a SQL view
- an RPC
- or an edge function

Do not assume that complexity before the first working version exists.

## UI Integration Strategy

The current UI hook:

- `libraries/ui/src/hooks/useSdk.tsx`

should remain compatible with the inherited SDK during the fork baseline.

Later options:

- keep one SDK object and progressively implement intelligence methods
- add a typed guard for intelligence capability
- or add intelligence-specific hooks once the product layer is real

## Safe Integration Order

1. apply extension SQL
2. expose intelligence table types
3. add `F2aSupabaseApi` intelligence methods
4. add a first ranked jobs surface in the UI
5. migrate screens one by one

## What Not To Do

- do not replace `listJobs` immediately
- do not make ranked jobs mandatory before the intelligence layer exists
- do not intertwine rebrand work with intelligence API work
- do not block the fork baseline on final ranking/filtering architecture

## Success Condition

The extension plan is working when:

- the inherited client API still functions
- intelligence methods can be added incrementally
- future ranking/filtering UI has a clear client-side integration path
