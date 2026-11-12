# Identity Surface

## Purpose

This document groups the main `first2apply` identity touchpoints so the eventual rename/rebrand can happen in a controlled order.

## Rename Inputs Needed Later

When the final brand is chosen, replace all legacy identity with:

- `PRODUCT_NAME`
- `PACKAGE_SCOPE`
- `APP_PROTOCOL`
- `PRIMARY_DOMAIN`
- `WINDOWS_APP_ID`
- `MACOS_BUNDLE_ID`

## Group 1: Must Change First

These control package identity, auth redirects, deep links, packaging, or release behavior.

### Workspace / package names

- `/package.json`
- `/libraries/core/package.json`
- `/libraries/ui/package.json`
- `/apps/backend/package.json`
- `/apps/webapp/package.json`
- `/apps/landingPage/package.json`
- `/apps/nodeBackend/package.json`
- `/apps/desktopProbe/package.json`

### Protocol / auth redirects

- `/apps/desktopProbe/src/index.ts`
- `/libraries/ui/src/lib/supabaseApi.ts`
- `/apps/backend/supabase/config.toml`

### Packaging / release identity

- `/apps/desktopProbe/forge.config.ts`
- `/.github/workflows/linux-release.yml`
- `/.github/workflows/macos-release.yml`
- `/.github/workflows/ms-store-release.yml`

## Group 2: Should Change Early

These are user-facing product identity surfaces.

### Docs / project surface

- `/README.md`
- `/docker-compose.yml`
- `/nginx.conf`

### Landing page / website

- `/apps/landingPage/src/components/head.tsx`
- `/apps/landingPage/src/components/footer.tsx`
- `/apps/landingPage/src/components/navbar.tsx`
- `/apps/landingPage/src/components/feedbackSection.tsx`
- `/apps/landingPage/src/components/productSection.tsx`
- `/apps/landingPage/src/pages/index.tsx`
- `/apps/landingPage/src/pages/download.tsx`
- `/apps/landingPage/src/pages/privacy-policy.tsx`
- `/apps/landingPage/src/pages/terms-of-service.tsx`
- `/apps/landingPage/src/pages/changelog.tsx`

### Web companion

- `/apps/webapp/src/app/layout.tsx`
- `/apps/webapp/src/app/page.tsx`
- `/apps/webapp/public/favicons/site.webmanifest`
- `/apps/webapp/next.config.ts`

## Group 3: Safe To Defer

These should be cleaned eventually but do not block the baseline fork.

- `/CHANGELOG.md`
- `/docs/seoPlan.md`
- `/apps/blog/**`
- historical references in release notes

## Group 4: Do Not Hand Edit

These should update automatically when package changes are applied.

- `/pnpm-lock.yaml`

## Notes

- The release workflows include artifact names, S3 paths, and UI-facing release labels.
- The Supabase config includes redirect URLs and project ID.
- The desktop protocol is coupled to password reset and deep links.
- The package scope rename affects imports across the monorepo.
