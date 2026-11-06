# Ranking and Filtering Design

## Purpose

Define how jobs should be prioritized and filtered in a way that is better than existing job platforms and more transparent to users.

## Goals

- Help users see the most relevant jobs first
- Reduce time wasted on low-fit jobs
- Make filtering more flexible than LinkedIn
- Give users confidence in why jobs are shown or hidden
- Prefer user control and explanation over black-box behavior

## Core Concepts

- `Filtering` decides whether a job should be shown, hidden, or deprioritized
- `Ranking` decides the order in which visible jobs should appear
- `Explanation` tells the user why that happened

## Initial Filtering Categories

- Hard exclusions
- Soft exclusions / deprioritization

## Initial Ranking Dimensions

- Match to user role targets
- Match to skills/preferences
- Freshness / urgency
- Source confidence
- Compensation fit
- Remote/location fit
- Seniority fit

## Explanation Model

Each job should eventually include:

- why it ranked highly
- what made it a weaker fit
- why it was filtered or deprioritized
- what evidence triggered the decision

## Design Principle

Ambiguity should usually favor keeping a job visible unless the user explicitly prefers strict filtering.

## User Modes

- Broad
- Balanced
- Strict

## MVP Approach

- Start with a small number of ranking factors
- Start with clear reasons and evidence
- Prefer deterministic logic where possible
- Use AI selectively where interpretation is genuinely useful
