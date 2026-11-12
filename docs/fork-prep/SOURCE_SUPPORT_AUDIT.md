# Source Support Audit

## Purpose

This document summarizes the job sources currently supported by the inherited parser pipeline and gives a practical recommendation for early fork scope.

## Current Supported Providers

The inherited codebase currently has parser branches for:

- LinkedIn
- Glassdoor
- Indeed
- Remote OK
- We Work Remotely
- Dice
- FlexJobs
- BestJobs
- EchoJobs
- Remotive
- Remote.io
- Built In
- Naukri
- Robert Half
- ZipRecruiter
- USA Jobs
- Talent
- Custom

## Current Seeded Site Records

The seed data currently includes:

- LinkedIn
- Glassdoor
- Indeed
- Remote OK
- We Work Remotely
- Dice
- FlexJobs
- BestJobs
- EchoJobs
- Remotive
- Remote.io
- Built In
- Naukri
- Robert Half
- ZipRecruiter
- USA Jobs
- Custom Job Board (Beta)

## Important Note

Parser support in code and site records in the database are related but not identical concerns.

- Code support means there is parser logic
- Seeded site records determine what is enabled/available in the product

## Deprecated Sites In Seed Data

These are already marked deprecated in `sites_rows.csv`:

- BestJobs
- EchoJobs
- Naukri
- ZipRecruiter

## Incognito Support

Only LinkedIn is currently marked with `incognito_support = true` in the seeded site data.

This likely means it has special handling in the job-description scan flow.

## Risk Tiers

## Tier 1: Keep for Early Fork

These are the best candidates for early support because they are strategically important or likely high-value enough to justify maintenance.

- LinkedIn
- Indeed
- Glassdoor
- Dice
- Built In
- USA Jobs

### Why

- high user familiarity or strategic value
- visible parser support in the codebase
- likely useful in an early “better-than-LinkedIn” positioning

## Tier 2: Optional Keep

These may be worth keeping if they map to your target audience, but do not need to be first-priority in the fork baseline.

- Remote OK
- We Work Remotely
- Remotive
- Remote.io
- Robert Half
- FlexJobs

### Why

- useful niche/value
- less central than LinkedIn/Indeed/Glassdoor
- some may have business/model caveats depending on your product direction

## Tier 3: Defer or Disable Early

These are better treated as later support unless they directly matter to your target audience.

- BestJobs
- EchoJobs
- Naukri
- ZipRecruiter
- Custom Job Board (Beta)
- Talent

### Why

- already deprecated in some cases
- likely higher maintenance burden relative to near-term value
- custom parsing is strategically interesting but should not complicate the initial fork baseline

## Practical Early Fork Recommendation

For the early fork baseline, support a smaller, more defensible set:

- LinkedIn
- Indeed
- Glassdoor
- Dice
- Built In
- USA Jobs

Optional adds if they match your user base:

- Remote OK
- We Work Remotely
- Remotive

## Why Narrow the Set Early

- reduces parser maintenance burden
- makes baseline validation simpler
- reduces scope during rebrand/infra work
- lets the team focus on ranking/filtering moat sooner

## Product Strategy Note

For a “better-than-LinkedIn” product, the early source strategy should optimize for:

- user trust
- relevance
- broad enough discovery coverage
- manageable maintenance cost

It does not need to maximize source count immediately.

## Follow-Up Recommendation

Before production use, run a parser validation pass on the sites you choose to keep and record:

- does list parsing still work?
- does description parsing still work?
- are parse failures easy to diagnose?
- does the site still justify maintenance cost?
