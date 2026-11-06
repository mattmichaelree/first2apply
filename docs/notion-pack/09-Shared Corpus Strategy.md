# Shared Corpus Strategy

## Purpose

Evaluate whether we want to collect scraped jobs from installed users into a larger shared corpus and define the conditions under which that would make sense.

## Why This Is Attractive

A shared corpus could help us:

- build broader market coverage
- dedupe jobs across sources and users
- improve ranking and filtering quality
- run richer downstream intelligence
- reduce dependence on a single platform's surfaced view
- build a stronger long-term data asset

## Why This Is Sensitive

A shared corpus introduces:

- trust/privacy concerns
- consent requirements
- policy/legal considerations
- more complex architecture
- more complex dedupe and canonicalization needs
- potential risk if user-specific context leaks into shared data

## Decision Framework

Before implementing shared corpus ingestion, we must decide:

- Is ingestion opt-in or default?
- What exact data is sent?
- What user identifiers are stripped?
- What fields are stored centrally?
- How do we dedupe across multiple users/sources?
- How do we explain this clearly to users?
- What sources are safe/acceptable to centralize?

## Recommended Starting Position

Do not make shared corpus a default assumption in the first version.

Recommended posture:

- start with user-private jobs only
- design the architecture so shared ingestion is possible later
- only introduce centralized ingestion with explicit consent and a clean data boundary

## Recommended Architecture Boundary

Keep separate:

- User-private data
- Shared corpus data

## MVP Decision

For MVP, prioritize a clean seam for future corpus ingestion, not full implementation.
