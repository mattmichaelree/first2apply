# Schema Evolution Notes

## Purpose

This page explains how to evolve the inherited schema toward the new product layer without collapsing all concerns into the original `jobs` model.

## Current Situation

The inherited product stores the discovered job in `public.jobs`.

That is enough for the discovery baseline, but not ideal for long-term intelligence work.

## Main Risk

If every new ranking, filtering, and corpus feature is stuffed directly into `public.jobs`, the table will become:

- overloaded
- harder to reason about
- harder to migrate
- harder to split into user-private vs shared concerns later

## Recommended Approach

### Keep `jobs` as the user-private discovered-job baseline

Use it for:

- discovered jobs
- core metadata needed by the UI
- user-owned lifecycle state

### Add supporting tables for new concerns

Use additive tables for:

- enrichment
- scores
- filter decisions
- structured search intent
- structured filter rules

## Why Additive First

- lower risk
- easier rollback
- keeps inherited code working
- easier to experiment on the intelligence layer
- supports future shared corpus separation

## When To Modify `jobs`

Modify `jobs` only when a field is:

- core to every discovered job
- required by the inherited UI or baseline flow
- stable enough to justify first-class storage

Examples that may eventually justify promotion:

- normalized remote type
- normalized seniority
- canonical job reference

## When Not To Modify `jobs`

Do not add fields to `jobs` just because:

- they are useful for one ranking experiment
- they belong to explanation output
- they are specific to one filtering version
- they are only relevant if shared corpus exists later

## Future Shared Corpus Consideration

If a shared corpus is added later, the likely shape is:

- `jobs` stays user-private
- shared/canonical jobs live in separate tables
- `jobs` may reference canonical entities indirectly

This is another reason to avoid overloading `jobs` too early.

## Practical Rule

Start with additive schema.

Only fold concepts back into core tables after:

- they prove durable
- they are used widely
- they simplify the product rather than complicate it
