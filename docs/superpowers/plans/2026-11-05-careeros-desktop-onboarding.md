# CareerOS Desktop Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CareerOS Desktop start or reuse the current loopback CareerOS API/web runtime and guide installation of the canonical Job Sweep extension without token copying.

**Architecture:** The Electron main process owns only local runtime orchestration, health reporting, and native onboarding. It launches the existing `careeros-jobs` startup script from a validated checkout, stages the canonical Job Sweep Chrome directory for packaging, and leaves pairing plus all job/business behavior in CareerOS and Job Sweep.

**Tech Stack:** Electron 41, TypeScript, Jest, PowerShell launcher, Electron Forge.

**Spec:** Orca dispatch task `task_334d6617a932`.

## Global Constraints

- Work only in this isolated first2apply child worktree and preserve unrelated user changes.
- Bind and navigate to loopback services only.
- Fail closed when the CareerOS runtime or canonical Job Sweep identity cannot be validated.
- Keep business logic and extension-pairing authority in CareerOS.
- Do not deploy production services.

## Review Focus

- An unrelated process on port 8001 must not be mistaken for CareerOS.
- A missing or incomplete CareerOS checkout must produce an actionable fallback, not a silent blank window.
- A Job Sweep copy with a different stable extension ID must never be staged.
- Normal setup must not expose or request a bearer token.
- Autostart rollback must preserve the bundled Desktop renderer.

---

### Task 1: CareerOS runtime startup and health

**Files:**
- Create: `apps/desktopProbe/src/server/careerOsRuntime.ts`
- Create: `apps/desktopProbe/src/server/careerOsRuntime.test.ts`
- Modify: `apps/desktopProbe/src/index.ts`
- Modify: `apps/desktopProbe/src/env.ts`

**Interfaces:**
- Produces: `ensureCareerOsRuntime(options): Promise<CareerOsRuntimeResult>` and validated runtime-path discovery.

- [ ] Write tests for ready reuse, checkout discovery, startup, invalid health, disabled autostart, and actionable failure.
- [ ] Run the focused tests and confirm they fail because the runtime module is absent.
- [ ] Implement the smallest validated PowerShell-launch and health behavior.
- [ ] Integrate startup before hosted-page loading while retaining the bundled-renderer fallback.
- [ ] Run focused tests and typecheck.

### Task 2: Canonical Job Sweep staging and native onboarding

**Files:**
- Create: `apps/desktopProbe/src/server/jobSweepPackage.ts`
- Create: `apps/desktopProbe/src/server/jobSweepPackage.test.ts`
- Create: `apps/desktopProbe/scripts/stage-job-sweep.ts`
- Modify: `apps/desktopProbe/package.json`
- Modify: `apps/desktopProbe/forge.config.ts`
- Modify: `apps/desktopProbe/src/server/trayMenu.ts`
- Modify: `apps/desktopProbe/src/index.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `resolveCanonicalJobSweepDirectory`, `stageJobSweepPackage`, and a stable packaged `resources/job-sweep/chrome` directory.

- [ ] Write tests that stage a valid stable-ID extension and reject missing identity, changed identity, and manual-token UI drift.
- [ ] Run the focused tests and confirm expected failures.
- [ ] Implement staging, package hooks, first-run native instructions, and a repeatable tray setup action.
- [ ] Run focused tests, staging against the canonical source, and typecheck.

### Task 3: Smoke test and rollback runbook

**Files:**
- Create: `apps/desktopProbe/scripts/careeros-onboarding-smoke.ts`
- Create: `docs/careeros-desktop-onboarding.md`
- Modify: `README.md`
- Modify: `apps/desktopProbe/.env.example`

**Interfaces:**
- Consumes: runtime health and Job Sweep staging contracts from Tasks 1-2.
- Produces: `pnpm --filter careeros-desktop smoke:onboarding` and explicit rollback instructions.

- [ ] Add a bounded smoke that validates the live loopback API/web and staged extension contract without writes.
- [ ] Document Chrome load-unpacked, one-click local pairing, health diagnostics, logs, and rollback.
- [ ] Run Desktop tests, smoke, typecheck, build/package-oriented staging checks, and inspect the final diff.
- [ ] Commit the scoped changes.
