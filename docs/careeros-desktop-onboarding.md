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

The bounded smoke starts or reuses CareerOS, stages the canonical extension, verifies API/web health, checks the stable extension identity, confirms an unrecognized extension origin receives HTTP 403, and verifies that the canonical origin can establish an authenticated local session. It never prints the session token, saves a job, or calls an external provider.

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
  "pairing_status": "ready",
  "token_copy_required": false
}
```

Direct read-only health checks:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/health/ready
(Invoke-WebRequest http://127.0.0.1:5174/ -UseBasicParsing).StatusCode
```

Startup logs are in `<careeros-jobs>\.runtime\api.out.log`, `api.err.log`, `web.out.log`, and `web.err.log`. Port 8001 is the API; its root returning 404 is normal. Port 5174 is the web app.

## Optional local provider credentials

Open the tray menu and choose **Local provider credentials**. This dedicated local window supports Career Memory's private read-only gateway plus Apify, Apollo, Crunchbase, Exa, Resend, and Gmail OAuth. Every saved field is encrypted through Electron `safeStorage` into a provider-specific binary file under Desktop's `userData\provider-credentials` directory. The window uses an ephemeral renderer partition, receives only configured/redacted status, and never writes credentials to browser storage, plain JSON, API responses, or logs.

For Career Memory, enter the private gateway URL (normally `https://career.mattos.xyz`) and its gateway username and password. Desktop supplies these only to the local CareerOS process. CareerOS requires HTTPS for this Basic-auth connection and keeps the integration read-only.

Saving or removing a value does not contact the provider and does not enable provider execution. Restart the local CareerOS services so the Desktop launcher can supply only the configured provider environment variables to the new child process. Then open the CareerOS **Providers** workspace and use its explicit **Validate** action. Hosted CareerOS credentials remain deployment secrets; Desktop does not upload or manage them.

If OS protected storage is unavailable, the window explains the failure and refuses to save or inject plaintext. On Linux, Electron's `basic_text` and `unknown` fallback backends are treated as unavailable; a supported Secret Service or KWallet backend is required. Existing encrypted files remain removable.

### Credential recovery and removal

1. Remove one integration with **Local provider credentials → Remove**. Quit and restart the local CareerOS services to clear that provider from the child-process environment.
2. If a stored value cannot be decrypted after an OS account/keychain change, remove that provider in the same window and add it again. The unreadable ciphertext is never injected.
3. If the settings window cannot open, quit Desktop, locate Desktop's Electron `userData` directory, and remove only its `provider-credentials` subdirectory. This deletes local provider ciphertext; it does not change hosted deployment secrets or CareerOS records.
4. Reopen Desktop and add only the providers needed locally. Encrypted credential files are tied to the OS protection context and should not be copied between machines or OS accounts.

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
