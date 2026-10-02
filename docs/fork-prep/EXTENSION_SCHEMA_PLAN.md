# Extension Schema Plan

## Purpose

This document proposes the first set of additive schema changes for the new product layer.

The goal is to create clean extension seams without destabilizing the inherited discovery model.

## Guiding Principle

Do not immediately overload the inherited `jobs` table with every future intelligence concern.

Use additive tables first.

## Recommended First Tables

## 1. `user_search_profiles`

### Purpose

Stores structured search intent beyond freeform prompts.

### Example fields

- `id`
- `user_id`
- `target_titles`
- `target_skills`
- `excluded_skills`
- `salary_min`
- `preferred_locations`
- `remote_preferences`
- `seniority_preferences`
- `work_authorization`
- `created_at`
- `updated_at`

## 2. `user_filter_rules`

### Purpose

Stores explicit filtering rules separate from ranking logic.

### Example fields

- `id`
- `user_id`
- `rule_type`
- `operator`
- `value_json`
- `enabled`
- `strictness`
- `created_at`
- `updated_at`

## 3. `job_enrichments`

### Purpose

Stores normalized and inferred metadata extracted after scraping/parsing.

### Example fields

- `id`
- `job_id`
- `normalized_title`
- `normalized_company`
- `normalized_location`
- `remote_type`
- `seniority_level`
- `salary_normalized_min`
- `salary_normalized_max`
- `employment_type`
- `required_skills`
- `excluded_geographies`
- `enrichment_version`
- `created_at`
- `updated_at`

## 4. `job_scores`

### Purpose

Stores one or more score outputs for each job.

### Example fields

- `id`
- `job_id`
- `user_id`
- `fit_score`
- `urgency_score`
- `quality_score`
- `freshness_score`
- `overall_score`
- `score_version`
- `created_at`
- `updated_at`

## 5. `job_filter_decisions`

### Purpose

Stores explainable filtering or deprioritization outcomes.

### Example fields

- `id`
- `job_id`
- `user_id`
- `decision`
- `reason_short`
- `reason_long`
- `evidence_json`
- `mode`
- `decision_version`
- `created_at`

## Optional Later Tables

## 6. `canonical_jobs`

For cross-user / cross-source normalized jobs.

## 7. `job_sources`

For many-to-one source mapping into canonical jobs.

## 8. `job_ingestion_events`

For raw ingestion tracking, hashes, source metadata, parser version, and client metadata.

## MVP Recommendation

For the first extension pass, add only:

- `user_search_profiles`
- `user_filter_rules`
- `job_enrichments`
- `job_scores`
- `job_filter_decisions`

## Why This Order

- creates a clean product layer
- supports explainability
- avoids risky rewrites
- makes it easier to change ranking/filtering logic later
