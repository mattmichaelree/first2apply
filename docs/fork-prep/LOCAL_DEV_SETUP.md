# Local Dev Setup

## Purpose

Use this when bootstrapping the repo locally before baseline validation.

This is intentionally short and focused on the minimum setup required to work on the fork.

## Expected Tooling

- Node.js available locally
- Corepack available locally
- pnpm available through Corepack
- project dependencies installed

## Minimum Bootstrap Steps

1. confirm Node is installed
2. confirm Corepack is available
3. enable or use Corepack-managed pnpm
4. install workspace dependencies
5. only then run build/lint/type checks

## Recommended Commands

From the repo root:

```powershell
node -v
corepack --version
corepack pnpm install
```

After install:

```powershell
corepack pnpm build
```

Or for a narrower package-level check:

```powershell
corepack pnpm -C libraries/core build
```

## Common Failure Modes

### `pnpm` Not Found

Cause:

- pnpm is not globally installed and Corepack is not being used

Fix:

- use `corepack pnpm ...` instead of assuming a global `pnpm`

### `tsc` Not Recognized

Cause:

- workspace dependencies have not been installed yet

Fix:

- run `corepack pnpm install` at the repo root first

### Build Works in One Package but Not the Monorepo

Cause:

- root dependencies or Nx tasks are not installed/configured yet

Fix:

- install from the workspace root
- then run the root build or targeted Nx command

## Practical Rule

Do not trust build or typecheck failures until:

- dependencies are installed
- the command is being run from the correct workspace level
- the intended env files are present

## Fork-Specific Reminder

Local toolchain setup is separate from the rename/infrastructure work.

A fork can look broken when the real issue is simply:

- no dependencies installed
- pnpm not invoked through Corepack
- env files not created yet
