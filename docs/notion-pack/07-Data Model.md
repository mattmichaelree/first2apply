# Data Model

## Purpose

Define the data layers that support both the inherited discovery engine and our new ranking/filtering/intelligence layer.

## Current Inherited Model

The inherited system already has core entities such as:

- Sites
- Links
- Jobs
- Notes
- Profiles
- Advanced matching config
- HTML dumps for parser failures

This model is useful as the initial discovery and persistence layer.

## Guiding Principle

Do not overload the inherited `jobs` table with every future concern.

Instead, treat the inherited model as the baseline ingestion layer and add new entities for intelligence, ranking, filtering, and optional shared corpus features.

## Recommended Layers

### 1. User-Private Discovery Layer

- `links`
- `jobs`
- `notes`
- `profiles`

### 2. Intelligence Layer

- `job_enrichments`
- `job_scores`
- `job_filter_decisions`
- `user_search_profiles`
- `user_filter_rules`

### 3. Optional Shared Corpus Layer

- `canonical_jobs`
- `job_sources`
- `job_ingestion_events`

## Data Model Principle

- Keep user-private workflow separate from shared market intelligence
- Keep raw ingestion separate from normalized intelligence
- Keep rankings and filter decisions auditable and explainable

## MVP Recommendation

Start by adding:

- `job_enrichments`
- `job_scores`
- `job_filter_decisions`
- `user_search_profiles`
- `user_filter_rules`
