# Contributing

## Purpose

This repository is being used as a core acquisition for a new career/job-intelligence product.

The inherited scraping and parsing engine is useful infrastructure, but it is not the final product architecture.

## Working Principles

- Keep the inherited scrape/parse core stable first
- Separate inherited-core work from new-moat work
- Prefer additive changes over broad rewrites
- Avoid changing unrelated areas in the same PR
- Optimize for practical user value, not novelty
- Record meaningful decisions in the project docs

## Scope Guidance

Inherited-core work typically includes:

- desktop scraping
- parser maintenance
- infra wiring
- auth/backend baseline
- build and packaging stability

New-moat work typically includes:

- ranking
- scoring
- filtering
- explainability
- dedupe/canonicalization
- shared corpus architecture
- product UX and workflow

## Branch Naming

Use one of:

- `feat/...`
- `fix/...`
- `infra/...`
- `schema/...`
- `spike/...`

## Pull Requests

Keep PRs focused.

Each PR should explain:

- what changed
- why it changed
- whether it affects inherited core or new moat
- risks
- validation performed
- follow-up work

## Issues

Use GitHub Issues for:

- code-specific bugs
- implementation follow-ups
- parser breakages
- technical debt tied to code

Use Notion and Linear for:

- product planning
- strategic decisions
- roadmap
- research

## Architecture Guidance

Do not overload inherited per-user job tables with future shared-corpus responsibilities.

When adding new product logic, prefer clean extension seams:

- new schema files
- new supporting tables
- new API surfaces
- new typed models

## Documentation

Relevant starter docs live in:

- `docs/notion-pack/`
- `docs/ops-pack/`

## Validation

Before merging substantial changes, prefer verifying:

- auth still works
- saved-link flow still works
- list scraping still works
- job persistence still works
- job-description parsing still works
- desktop app still builds
