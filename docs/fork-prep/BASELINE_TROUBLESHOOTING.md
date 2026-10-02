# Baseline Troubleshooting

## Purpose

Use this when the fork is partially wired but the inherited baseline is not working yet.

This is not a full debugging guide. It is a fast triage document for the most likely fork failures.

## Symptom: Login or Signup Fails

Check:

- Supabase URL is correct
- Supabase anon key is correct
- auth redirect URLs match the current protocol/domain
- desktop app is pointing at the intended environment

Likely causes:

- stale env values
- old redirect URL still using `first2apply://`
- wrong Supabase project

## Symptom: Password Reset Opens the Wrong App or Fails

Check:

- custom protocol string in the desktop app
- reset redirect in shared client code
- Supabase redirect allowlist
- whether another app is still registered for the old protocol

Likely causes:

- protocol not renamed consistently
- both old and new apps installed locally

## Symptom: Package Install or Build Breaks After Rename

Check:

- all workspace package names
- all `@first2apply/*` imports
- root package references
- generated lockfile after rename

Likely causes:

- incomplete package-scope rename
- stale workspace dependency names

## Symptom: Save-Link Flow Works but Scanning Does Nothing

Check:

- desktop app is actually running the scanner
- `scan-urls` function is deployed or available locally
- supported site exists in the database
- the saved URL maps to a supported provider

Likely causes:

- function env missing
- site seed data not imported
- chosen URL belongs to a deprecated or unsupported source

## Symptom: Jobs Do Not Persist

Check:

- backend function logs
- database tables exist in the target Supabase project
- RLS/policies were applied correctly
- client is pointing to the same project the functions are using

Likely causes:

- schema not applied fully
- wrong environment in one layer
- function writes failing silently

## Symptom: Description Scan Fails but List Scan Works

Check:

- job detail URLs are valid
- `scan-job-description` function is available
- parser supports the active source
- HTML dump/failure path is working

Likely causes:

- source-specific parser breakage
- missing detail-page parser support
- parser assumptions drifting from the current site HTML

## Symptom: Jobs Exist in DB but UI Is Empty

Check:

- desktop UI is querying the correct status bucket
- list query params are not over-filtering
- shared client types still match the database payload
- session/user scope is correct

Likely causes:

- jobs inserted with unexpected status
- UI filter state hiding results
- client/server type drift

## Symptom: Desktop Build Works but Packaging Fails

Check:

- bundle ID / app ID settings
- maker/publisher config
- updater config references
- signing settings if enabled

Likely causes:

- legacy bundle identity still present
- packaging config assumes old product name
- signing variables missing

## Symptom: Only Some Sources Work

Check:

- whether the source is in the recommended alpha set
- whether the source is deprecated in seed data
- whether a parser exists in code for the provider

Likely causes:

- source drift
- deprecated source kept active too early
- parser not validated after fork

## Fastest Recovery Rule

If baseline validation gets noisy:

1. cut active scope back to the smallest source set
2. stub optional providers
3. validate one auth flow and one end-to-end scrape flow
4. only expand after the baseline is proven

## Escalation Rule

If a failure blocks auth, save-link, list scan, or description scan across multiple sources, stop polishing and fix the baseline first.
