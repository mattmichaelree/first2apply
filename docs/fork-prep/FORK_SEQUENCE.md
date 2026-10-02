# Fork Sequence

## Purpose

This is the practical execution order for getting the inherited product onto new infrastructure with minimal churn.

## Step 1: Identity Planning

Collect final values for:

- product name
- package scope
- protocol
- domain
- Windows app ID
- macOS bundle ID

Do not start broad rename work until these are known.

## Step 2: Package / Protocol Rename

Change first:

- package names
- import scopes
- desktop protocol
- Supabase redirect URLs
- desktop packaging IDs

This reduces the chance of auth and build breakage.

## Step 3: Infrastructure Swap

Stand up:

- new Supabase project
- new auth redirects
- new AI credentials
- billing stub or replacement

Then wire local env files.

## Step 4: Baseline Validation

Verify:

- sign-up/login
- save link
- list scraping
- persistence
- description scraping
- desktop build/package

Only after this should the repo be considered the acquired baseline.

## Step 5: Scope Reduction

Ignore or remove from active execution:

- blog
- invoice tooling
- unrelated backend utilities

Keep focus on:

- desktop
- backend
- shared libraries

## Step 6: Extension Seams

Add:

- new schema for enrichment/scoring/filtering
- shared types
- new API seams

Do this without destabilizing inherited scrape/parse flow.

## Step 7: New Product Logic

Build:

- ranking
- filtering
- explanations
- optional shared corpus design

This is where the moat starts.
