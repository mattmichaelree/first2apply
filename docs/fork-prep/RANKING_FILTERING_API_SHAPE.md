# Ranking and Filtering API Shape

## Purpose

This document proposes the first API shape for the new intelligence layer without forcing a full implementation yet.

## Guiding Principle

Keep the inherited discovery APIs intact.

Add new APIs for:

- user search profile management
- structured filter rule management
- score retrieval
- filter decision retrieval
- explanation retrieval

## Proposed Core Types

The system will likely need these concepts:

- `UserSearchProfile`
- `UserFilterRule`
- `JobEnrichment`
- `JobScore`
- `JobFilterDecision`
- `JobExplanation`

## Proposed Read APIs

### `getUserSearchProfile()`

Returns the current structured search profile for the user.

### `listUserFilterRules()`

Returns the active structured filter rules.

### `getJobScore(jobId)`

Returns the latest score object for the job.

### `getJobFilterDecision(jobId)`

Returns the latest filter/deprioritization decision for the job.

### `getJobExplanation(jobId)`

Returns a consolidated explanation payload suitable for UI display.

## Proposed Write APIs

### `updateUserSearchProfile(profile)`

Creates or updates the structured search profile.

### `createUserFilterRule(rule)`

Adds a new structured filter rule.

### `updateUserFilterRule(ruleId, updates)`

Updates a filter rule.

### `deleteUserFilterRule(ruleId)`

Removes a filter rule.

## Proposed Explanation Payload

Each job explanation should eventually support:

- why it ranked highly
- why it was a weaker match
- why it was filtered or deprioritized
- which rules applied
- which signals were inferred vs directly observed

## UI-Oriented Shape

A practical explanation object could include:

- `summary`
- `fit_reasons[]`
- `concerns[]`
- `filter_reasons[]`
- `evidence[]`
- `mode`
- `versions`

## Implementation Guidance

Do not force this into the inherited SDK all at once.

Preferred path:

1. add supporting types
2. add supporting tables
3. add read APIs first
4. add write APIs for structured rules/profile
5. later integrate ranking/filtering more deeply into list views
