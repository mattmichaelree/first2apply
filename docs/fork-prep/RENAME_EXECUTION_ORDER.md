# Rename Execution Order

## Purpose

Use this when the founder inputs are ready and the repo is moving from planning into the first real rename pass.

The goal is to change identity in a safe order so auth, package resolution, and desktop packaging do not break all at once.

## Required Founder Inputs

Before starting, lock:

- product name
- short slug
- package scope
- desktop protocol
- primary domain
- Windows app ID
- macOS bundle ID

## Rename Strategy

Do the rename in layers.

Do not try to rename every user-facing string in the repo before the baseline works.

## Layer 1: Package / Import Identity

Change these first:

- root `package.json`
- package names under `apps/*/package.json`
- package names under `libraries/*/package.json`
- all `@first2apply/*` imports

Why first:

- workspace resolution depends on this
- build/install issues are easier to catch early

## Layer 2: Desktop Protocol / Auth Redirect Identity

Change next:

- `apps/desktopProbe/src/index.ts`
- any `first2apply://` deep links
- password reset redirect usage in shared UI or client helpers
- Supabase redirect settings in `apps/backend/supabase/config.toml`

Why second:

- auth callback and password reset flows depend on this
- it is one of the easiest ways to get a half-working fork

## Layer 3: App / Bundle / Packaging Identity

Change next:

- desktop `package.json`
- `apps/desktopProbe/forge.config.ts`
- updater config
- workflow/release filenames and bundle identifiers

Why third:

- packaging and desktop identity should match the new protocol and package names

## Layer 4: Core Environment / Domain Identity

Change next:

- env examples
- Supabase config values
- web URLs
- support/contact URLs
- any provider callback URLs

Why fourth:

- this is where the repo actually starts pointing to your environment

## Layer 5: Product Copy / Landing / Legal Surfaces

Change after the baseline is close:

- landing page copy
- webapp metadata
- README and docs branding
- legal page identity
- email template copy

Why later:

- these matter for launch, but they are not the critical path for a working fork

## Suggested Working Sequence

1. create a dedicated rename branch
2. change package names and imports
3. run install/build checks
4. change desktop protocol and auth redirects
5. update bundle IDs and packaging config
6. update env/config defaults
7. validate auth flow
8. validate save-link flow
9. validate scraping flow
10. clean remaining product-copy references

## What To Stub During Rename

To keep the first pass small, it is safe to stub or defer:

- Stripe polish
- analytics
- lifecycle email
- auto-updater publishing
- landing page rewrite
- blog

## High-Risk Rename Areas

Watch these carefully:

- package scope changes
- `first2apply://` deep links
- Supabase redirect URLs
- workflow/release artifact names
- desktop app IDs and bundle IDs

## Success Condition

The rename pass is good enough when:

- the repo builds
- auth works with the new protocol/domain
- desktop app launches under the new identity
- inherited scrape/parse flows still work

Everything else can be cleaned afterward.
