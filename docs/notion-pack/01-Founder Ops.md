# Founder Ops

## Overview

We are building a `careerOS / job intelligence product` for job seekers.

We are using an inherited desktop scraper/parser codebase as a `core acquisition`, not as our final architecture.

## Core Acquisition

What the inherited code gives us:

- Desktop app shell
- Local browser-based job scraping
- Parsing of job list pages and job descriptions
- Persistence of jobs and metadata
- A fast discovery baseline

What it does not give us:

- Our moat
- Our final product UX
- Our long-term architecture
- Our trust/policy model
- Our differentiated ranking/filtering logic

## Our Moat

What we are building ourselves:

- Better-than-LinkedIn filtering
- Ranking and prioritization
- Explainable job intelligence
- Better recall of real jobs
- Dedupe and canonicalization
- Optional shared corpus strategy
- Stronger workflow and careerOS features

## Current Priorities

1. Fork and rebrand
2. Stand up our infrastructure
3. Get inherited end-to-end flow working on our systems
4. Tag `acquired core baseline`
5. Add extension seams for enrichment, scoring, and filtering
6. Build our intelligence layer
7. Decide whether and how to support shared corpus ingestion

## Execution Principles

- Keep inherited scrape/parse flow stable first
- Avoid broad rewrites too early
- Separate inherited-core work from new-moat work
- Add new systems in parallel where possible
- Optimize for practical utility, not hype
- Write down important decisions once

## Operating System

- `Notion` = brain
- `Linear` = work queue
- `GitHub` = code truth

## LLM Roles

- `Codex` = implementation
- `Claude` = strategy and architecture
- `ChatGPT` = synthesis, copy, communication
- `Perplexity` = research and sourcing

## Working Rhythm

### Monday

- Review roadmap and decisions
- Set weekly priorities
- Assign tasks to the right tool or person

### During the Week

- Track work in Linear
- Keep code changes in GitHub
- Update Notion only when a real decision is made

### Friday

- Review what shipped
- Log key decisions
- Capture learnings and risks
- Set next week's priorities

## Scope Rules

- Ignore blog, invoice tooling, and unrelated utilities early
- Keep landing page/web companion only if they directly help near-term goals
- Do not overload inherited per-user jobs model if shared corpus is added
- Do not treat inherited advanced matching as our long-term intelligence system

## Current Milestone

Get the inherited discovery engine running fully under our branding and infrastructure.

## Definition of Success

- User can sign in
- User can save a search link
- Jobs scrape successfully
- Jobs persist in our backend
- Jobs render in the desktop app
- App builds under our identity

## Decision Rule

Inherited code gets us speed.

Our company value comes from what we build on top of it.
