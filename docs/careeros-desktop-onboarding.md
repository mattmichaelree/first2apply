# CareerOS Desktop local onboarding

CareerOS Desktop is the local shell. It starts or reuses the current CareerOS API and web build from the canonical `careeros-jobs` checkout, then loads the web app from loopback. Job Sweep remains the browser capture surface, and CareerOS remains responsible for pairing, canonical job state, analysis, and every business decision.

## First local start

Prerequisites:

- The `careeros-jobs` checkout, with its locked Python and web dependencies installed.
- This workspace installed with `corepack pnpm install --frozen-lockfile`.
- The canonical Job Sweep checkout. Its Chrome source is `job-sweep\extension\chrome` and its stable extension ID is `jgpidoojnckcjkpefbjhpiagfniemena`.

The standard checkout locations under `Documents\Playground` are found automatically. If the repositories live elsewhere, put these paths in `apps\desktopProbe\.env`:

```dotenv
CAREEROS_JOBS_DIR=C:\path\to\careeros-jobs
JOB_SWEEP_CHROME_DIR=C:\path\to\job-sweep\extension\chrome
```

Build the shared workspace declarations once, then start Desktop:

```powershell
corepack pnpm --filter @careeros/core build
corepack pnpm --filter @careeros/ui build
corepack pnpm --filter careeros-desktop start
```

Desktop checks `http://127.0.0.1:8001/health/ready` and `http://127.0.0.1:5174/`. If they are not ready, it validates the discovered checkout and runs that checkout's `scripts\start-careeros.ps1 -NoBrowser`. Only the loopback API and web origins are accepted. If startup fails, Desktop shows the recovery action and opens its bundled fallback instead of exposing Electron capabilities to another host.

## Add and connect Job Sweep in Chrome

Desktop shows setup on the first healthy start. The same guide is always available from the tray icon under **Job Sweep setup**.

1. Choose **Show Job Sweep folder** in Desktop.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Choose **Load unpacked**, then select the `chrome` folder Desktop showed.
4. Open Job Sweep Manager, turn on **Use CareerOS**, and choose **Connect**.
5. Return to Desktop setup and choose **I've connected it**.

Connect requests a session directly from the loopback CareerOS API. Normal local use has no bearer-token field and requires no token copying. The API allowlists the exact stable extension origin; an altered or unrecognized extension fails closed.

## Health and smoke checks

The bounded smoke starts or reuses CareerOS, stages the canonical extension, verifies API/web health, checks the stable extension identity and local-pairing contract, and confirms an unrecognized extension origin receives HTTP 403. It does not save a job, issue an approved pairing token, or call an external provider.

```powershell
corepack pnpm --filter careeros-desktop smoke:onboarding
```

Expected summary fields include:

```json
{
  "status": "ok",
  "api": "ready",
  "web": "http_200",
  "extension_id": "jgpidoojnckcjkpefbjhpiagfniemena",
  "invalid_pairing_status": 403,
  "token_copy_required": false
}
```

Direct read-only health checks:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/health/ready
(Invoke-WebRequest http://127.0.0.1:5174/ -UseBasicParsing).StatusCode
```

Startup logs are in `<careeros-jobs>\.runtime\api.out.log`, `api.err.log`, `web.out.log`, and `web.err.log`. Port 8001 is the API; its root returning 404 is normal. Port 5174 is the web app.

## Package verification

Desktop packaging stages the canonical extension into the app resources before Electron Forge runs:

```powershell
$env:APP_BUNDLE_ID = 'com.careeros.desktop.dev'
$env:SUPABASE_URL = 'http://127.0.0.1:54321'
$env:SUPABASE_KEY = 'local-package-placeholder'
$env:MEZMO_API_KEY = ''
$env:AMPLITUDE_API_KEY = ''
corepack pnpm --filter careeros-desktop package
```

The package must contain `resources\job-sweep\chrome\manifest.json` and `resources\job-sweep\package-metadata.json`. Staging refuses a changed extension ID, a missing local-pairing client, or a Manager UI that restores manual bearer-token entry.

## Rollback

Rollback is local and does not change CareerOS data or the canonical Job Sweep source.

1. Quit Desktop from its tray menu.
2. In the PowerShell session used to launch Desktop, disable orchestration and the hosted web view:

   ```powershell
   $env:CAREEROS_AUTOSTART = 'false'
   $env:CAREEROS_WEB_URL = ''
   corepack pnpm --filter careeros-desktop start
   ```

   Desktop now uses its bundled renderer and will not start missing CareerOS services. This does not terminate services that were already running.

3. In Chrome, remove or disable the unpacked Job Sweep extension if needed. The source folder and CareerOS records are untouched.
4. To discard only generated package assets, from this repository run:

   ```powershell
   Remove-Item -LiteralPath .\apps\desktopProbe\.generated\job-sweep -Recurse -Force
   ```

   Recreate them at any time with `corepack pnpm --filter careeros-desktop stage:job-sweep`.
5. To restore normal behavior, remove the two process overrides and restart Desktop:

   ```powershell
   Remove-Item Env:CAREEROS_AUTOSTART -ErrorAction SilentlyContinue
   Remove-Item Env:CAREEROS_WEB_URL -ErrorAction SilentlyContinue
   ```

If a process must be stopped, first identify the listeners with `Get-NetTCPConnection -LocalPort 8001,5174 -State Listen` and confirm each owning process command line points to the intended `careeros-jobs` checkout before using `Stop-Process`.
