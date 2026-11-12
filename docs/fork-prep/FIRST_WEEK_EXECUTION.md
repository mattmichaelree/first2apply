# First Week Execution

## Purpose

This is the practical day-by-day plan for the first week of fork execution.

## Goal

By the end of week one, the inherited product should be positioned for infrastructure cutover and baseline validation, without wasting time on noncritical surfaces.

## Day 1: Workspace and Identity Prep

- read `FORK_CHECKLIST.md`
- read `IDENTITY_SURFACE.md`
- fill in `RENAME_INPUTS_TEMPLATE.md`
- confirm which apps are in active scope
- create or confirm working branch strategy

Outcome:

- identity inputs are known
- active scope is clear

## Day 2: Repo Identity Pass

- update package identity
- update desktop protocol
- update packaging IDs
- update redirect-related identity references
- avoid polishing user-facing copy beyond what blocks functionality

Outcome:

- repo is structurally yours

## Day 3: Supabase Setup

- create Supabase project
- apply base schema
- import site seed data
- configure redirect URLs
- prepare env files

Outcome:

- backend foundation exists

## Day 4: Desktop and Backend Wiring

- wire desktop env
- wire backend function env
- wire required provider values
- stub optional services if needed

Outcome:

- desktop and backend can talk to your infrastructure

## Day 5: Auth and Link Flow Validation

- verify sign-up
- verify login
- verify save-link flow
- verify links persist

Outcome:

- user entrypoint is functional

## Day 6: Scrape and Parse Validation

- validate list-page scraping
- validate job persistence
- validate description scraping
- validate jobs render in UI

Outcome:

- inherited engine is functionally alive under your infrastructure

## Day 7: Scope Cleanup and Baseline Review

- mark deferred apps/surfaces
- record blockers
- capture what is stubbed
- decide whether baseline is close enough to tag next week

Outcome:

- the project enters week two with clear focus on baseline completion and extension seams

## Week One Anti-Goals

Do not spend week one on:

- blog
- SEO
- polished marketing site
- perfect billing
- advanced scoring/ranking logic
- shared corpus implementation

## Week One Success Test

A successful first week means:

- the fork identity is mostly in place
- Supabase is live
- env/config wiring is understandable
- auth and link creation are working or nearly working
- the team is not distracted by non-core surfaces
