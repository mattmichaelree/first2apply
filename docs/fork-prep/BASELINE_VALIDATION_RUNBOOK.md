# Baseline Validation Runbook

## Purpose

Use this runbook after branding and infrastructure are wired to confirm that the inherited discovery engine works under the new environment.

## Preconditions

Before running this checklist, the following should already be true:

- package and protocol identity have been updated
- desktop env file exists
- backend function env file exists
- a Supabase project exists
- base schema has been applied
- `sites_rows.csv` has been imported
- desktop app points to the new Supabase project

## Validation Goal

At the end of this runbook, the inherited product should be proven usable as an acquired core baseline.

## 1. Environment Validation

- [ ] Desktop app env file exists and contains valid values
- [ ] Backend function env file exists and contains valid values
- [ ] Supabase URL is reachable
- [ ] Supabase anon key works for the client
- [ ] Supabase service role / function env values are present where needed
- [ ] Auth redirect URLs match the current protocol/domain setup

## 2. Auth Validation

- [ ] Sign up succeeds
- [ ] Login succeeds
- [ ] Session persists after reload
- [ ] Logout succeeds
- [ ] Password reset flow works or is intentionally stubbed

## 3. Link Creation Validation

- [ ] Open the create-link flow
- [ ] Save a valid supported job-search URL
- [ ] Link persists in the database
- [ ] Link shows in the UI
- [ ] No unexpected parser error occurs during save

## 4. List Scrape Validation

- [ ] Trigger scan for saved links
- [ ] Desktop app loads the page successfully
- [ ] HTML reaches the backend
- [ ] `scan-urls` completes without fatal error
- [ ] Jobs are inserted/upserted into the database
- [ ] Newly discovered jobs show in the app

## 5. Description Scrape Validation

- [ ] Open or trigger a job-description scan
- [ ] Desktop app loads job detail pages successfully
- [ ] `scan-job-description` completes without fatal error
- [ ] Description is stored
- [ ] Additional fields such as salary/tags update if available
- [ ] Job status transitions correctly

## 6. UI Validation

- [ ] Jobs list renders
- [ ] Job details render
- [ ] Labels/status changes work
- [ ] Filters/settings page loads
- [ ] Filter settings save/load works
- [ ] App navigation still works after the rebrand/protocol changes

## 7. Build / Packaging Validation

- [ ] Desktop app builds locally
- [ ] Packaging works or is intentionally deferred
- [ ] No hardcoded legacy bundle ID/protocol causes build failure

## 8. Logging / Failure Visibility

- [ ] Errors are visible enough to debug locally
- [ ] Failed parser runs can be identified
- [ ] HTML dump path is still working for parser failures
- [ ] Missing optional providers do not break baseline validation unless expected

## 9. Baseline Exit Criteria

You can tag the repo as `acquired core baseline` when:

- auth works
- save-link flow works
- list scraping works
- jobs persist
- description scraping works
- jobs render in the UI
- desktop app builds under the new identity

## Recommended Evidence To Capture

When the baseline is validated, save:

- one screenshot of login working
- one screenshot of discovered jobs rendering
- one screenshot of a job description page
- one short note describing what remains stubbed or deferred

## Known Safe Deferrals

The following can usually be deferred without blocking baseline validation:

- analytics
- advanced matching refinement
- release hosting
- MailerLite lifecycle sync
- polished billing
- landing page rewrite
