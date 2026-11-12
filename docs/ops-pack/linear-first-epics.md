# Linear First Epics

## Epic: Fork and Rebrand Inherited Codebase

- P0 Rename legacy product names, package scope, URLs, and protocol strings
- P0 Rebrand desktop app metadata and package identities
- P0 Replace desktop icons and product assets
- P0 Update app protocol and deep-link handling
- P1 Audit remaining legacy references in copy/emails/configs

## Epic: Stand Up Backend on Our Infrastructure

- P0 Create fresh Supabase project
- P0 Apply base database schema
- P0 Import supported job-site seed data
- P0 Create local env files and wire Supabase credentials
- P1 Audit and prune unsupported sites
- P1 Wire AI provider credentials
- P1 Stub or replace billing configuration
- P2 Wire analytics and email providers

## Epic: Validate Inherited Scrape/Parse Baseline

- P0 Verify sign-up/login against new infrastructure
- P0 Verify saved-link creation flow
- P0 Verify list-page scraping flow
- P0 Verify job persistence to backend
- P0 Verify job-description scraping flow
- P0 Verify jobs render in desktop UI
- P1 Verify filter settings save/load
- P1 Verify packaging/build under new identity
- P0 Tag acquired core baseline

## Epic: Create Extension Schema and API Seams

- P1 Add new schema file for custom product features
- P1 Add tables for job enrichment
- P1 Add tables for job scores
- P1 Add tables for filter decisions
- P1 Add tables for user search profiles
- P1 Add tables for user filter rules
- P1 Extend shared types for scoring/filtering/explanations
- P1 Extend SDK/API surface for new services
- P1 Write short architecture note for inherited core vs new extension layer

## Epic: Build V1 Ranking / Filtering Layer

- P2 Define first scoring dimensions
- P2 Define first filtering model
- P2 Implement first scoring pipeline
- P2 Implement first explainable filtering pipeline
- P2 Add ranking/filter explanation payloads
- P2 Replace inherited filters UX with v1 custom UX

## Epic: Decide Shared Corpus Architecture

- P1 Define decision memo: user-private vs opt-in shared corpus
- P2 Design ingestion payload for centralized collection
- P2 Design dedupe strategy
- P2 Design canonical jobs model
- P2 Define trust/privacy/consent requirements before implementation
