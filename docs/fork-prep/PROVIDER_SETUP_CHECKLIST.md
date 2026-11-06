# Provider Setup Checklist

## Purpose

This checklist groups external providers by fork priority so setup can happen in the right order.

## Required For Baseline

### Supabase

- [ ] Create project
- [ ] Record project URL
- [ ] Record anon key
- [ ] Record service role key where needed
- [ ] Apply base schema
- [ ] Import `sites_rows.csv`
- [ ] Update auth redirect URLs
- [ ] Verify local client connection
- [ ] Verify edge functions can access required env/config

## Strongly Recommended For Baseline

### AI Provider

- [ ] Decide AI provider for inherited advanced matching / custom parsing
- [ ] Create account/project
- [ ] Record endpoint
- [ ] Record API key
- [ ] Add env vars for backend functions
- [ ] Verify a test request can complete

### Billing

Choose one:

- [ ] Fully wire billing
- [ ] Stub billing and subscription assumptions for baseline

If wiring now:

- [ ] Create Stripe account
- [ ] Create products/prices
- [ ] Record secret key
- [ ] Record webhook secret
- [ ] Update billing config references

## Useful But Safe To Defer

### Release Hosting

- [ ] Decide release host / bucket
- [ ] Configure artifact destination
- [ ] Update release workflow assumptions
- [ ] Update landing/download links later

### Analytics

- [ ] Create analytics account
- [ ] Record API key
- [ ] Decide whether analytics is enabled at baseline

### Logging

- [ ] Decide whether to keep Mezmo/LogDNA or replace later
- [ ] Add key if keeping
- [ ] Otherwise tolerate local/no-op logging for baseline

### Transactional Email

- [ ] Decide email provider for alerts
- [ ] Record API key
- [ ] Verify sender setup

### Lifecycle Email

- [ ] Decide whether to keep MailerLite flow
- [ ] Record key if needed
- [ ] Otherwise defer

### Apple Packaging / Signing

- [ ] Decide whether macOS packaging is needed now
- [ ] Record Apple ID
- [ ] Record team ID
- [ ] Record app-specific password or equivalent

## Baseline Recommendation

To move fastest:

- set up Supabase now
- set up AI provider now if inherited AI features must work
- stub billing if it slows the baseline
- defer analytics/logging/lifecycle email until baseline works
