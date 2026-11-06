# Inherited Core vs New Moat

## Purpose

This page keeps the team aligned on what we inherited versus what actually creates product value for us.

## Inherited Core

These are acceleration assets:

- Desktop app shell
- Local browser-based job collection
- Scraping pipeline
- Job list parsing
- Job description parsing
- Retry/backoff/concurrency handling
- Supabase persistence model
- Shared type/API scaffolding
- Basic filter/settings flows

## Why We Keep It

- Saves time
- Gives us a functioning discovery engine
- Lets us get to product differentiation faster
- Avoids rebuilding low-level collection/pipeline infrastructure from scratch

## New Moat

These are the systems that should become the reason users choose us:

- Better-than-LinkedIn filtering
- Ranking and prioritization
- Explainable job intelligence
- Actual requirement extraction and interpretation
- Dedupe/canonicalization
- Optional shared job corpus
- Stronger user workflow
- Better product UX
- Better trust and consent model

## Why This Is the Moat

- Harder to copy than raw scraping
- More directly tied to user outcomes
- More defensible over time
- Less dependent on inherited product assumptions
- More aligned with the long-term `careerOS` vision

## Decision Rule

If a feature only preserves inherited functionality, it is maintenance.

If a feature improves filtering, ranking, intelligence, transparency, or workflow, it is moat-building.

## Working Heuristic

Ask:

- Is this helping us acquire the core?
- Or is this building the moat?

If it is neither, it is probably distraction.
