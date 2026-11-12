# Baseline Env Matrix

## Purpose

This document shows which environment variables matter for the baseline fork and which can be deferred.

## Root `.env`

### `SUPABASE_URL`

- Used by: web app / local development
- Baseline priority: required if using the web companion

### `SUPABASE_ANON_KEY`

- Used by: web app / local development
- Baseline priority: required if using the web companion

## Desktop App Env

Source: `/apps/desktopProbe/.env.example`

### `APP_BUNDLE_ID`

- Used by: desktop packaging and runtime identity
- Baseline priority: required

### `SUPABASE_URL`

- Used by: desktop client
- Baseline priority: required

### `SUPABASE_KEY`

- Used by: desktop client auth/API access
- Baseline priority: required

### `MEZMO_API_KEY`

- Used by: logging
- Baseline priority: optional

### `AMPLITUDE_API_KEY`

- Used by: analytics
- Baseline priority: optional

### `APPLE_ID`

- Used by: macOS signing
- Baseline priority: optional unless packaging for macOS now

### `APPLE_PASSWORD`

- Used by: macOS signing
- Baseline priority: optional unless packaging for macOS now

### `APPLE_TEAM_ID`

- Used by: macOS signing
- Baseline priority: optional unless packaging for macOS now

### `APPLE_CERT_PASSWORD`

- Used by: packaging/signing edge case
- Baseline priority: optional

## Backend Functions Env

Source: `/apps/backend/supabase/functions/.env.example`

### `AZURE_AI_FOUNDRY_ENDPOINT`

- Used by: AI features
- Baseline priority: optional for pure scraping baseline, recommended if inherited AI features should work

### `AZURE_AI_FOUNDRY_API_KEY`

- Used by: AI features
- Baseline priority: same as above

### `STRIPE_SECRET_KEY`

- Used by: billing webhooks
- Baseline priority: optional if billing is stubbed

### `STRIPE_WEBHOOK_SIGNING_SECRET`

- Used by: billing webhooks
- Baseline priority: optional if billing is stubbed

### `MAILERSEND_API_KEY`

- Used by: transactional email alerts
- Baseline priority: optional

### `MAILERLITE_API_KEY`

- Used by: lifecycle email sync
- Baseline priority: optional

### `MEZMO_API_KEY`

- Used by: backend logging
- Baseline priority: optional

### `F2A_WEBHOOK_SECRET`

- Used by: webhook authorization
- Baseline priority: recommended if the corresponding flows remain enabled

### `WEBAPP_URL`

- Used by: backend references to companion web app
- Baseline priority: optional unless web companion is in active baseline scope

## Minimum Baseline Set

If you want the smallest viable working setup:

### Desktop

- `APP_BUNDLE_ID`
- `SUPABASE_URL`
- `SUPABASE_KEY`

### Backend

- Supabase project/function config wired correctly
- AI env only if inherited AI features are being validated

## Recommended Baseline Set

### Desktop

- `APP_BUNDLE_ID`
- `SUPABASE_URL`
- `SUPABASE_KEY`

### Backend

- `AZURE_AI_FOUNDRY_ENDPOINT`
- `AZURE_AI_FOUNDRY_API_KEY`
- `F2A_WEBHOOK_SECRET`

## Safe To Delay

- analytics
- logging
- billing
- lifecycle email
- macOS signing
