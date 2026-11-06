import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const CAREEROS_API_READY_URL = 'http://127.0.0.1:8001/health/ready';
export const CAREEROS_WEB_URL = 'http://127.0.0.1:5174/';

const RUNTIME_MARKERS = [
  'pyproject.toml',
  path.join('scripts', 'start-careeros.ps1'),
  path.join('apps', 'web', 'package.json'),
];

type FetchFunction = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type RuntimeDirectoryOptions = {
  explicitDirectory?: string;
  appPath: string;
  homeDirectory: string;
};

type HealthCheck = {
  ready: boolean;
  detail: string;
};

export type CareerOsHealth = {
  api: HealthCheck;
  web: HealthCheck;
  ready: boolean;
};

export type CareerOsRuntimeResult = {
  status: 'ready' | 'unavailable';
  action: 'reused' | 'started' | 'disabled' | 'not_found' | 'failed';
  health: CareerOsHealth;
  runtimeDirectory?: string;
  guidance?: string;
};

type EnsureCareerOsRuntimeOptions = RuntimeDirectoryOptions & {
  autostart: boolean;
  fetchFn?: FetchFunction;
  runLauncher?: (scriptPath: string, workingDirectory: string) => Promise<void>;
};

function uniquePaths(paths: Array<string | undefined>) {
  const normalized = paths
    .filter((candidate): candidate is string => Boolean(candidate?.trim()))
    .map((candidate) => path.resolve(candidate));
  return [...new Set(normalized)];
}

export function isCareerOsRuntimeDirectory(directory: string) {
  try {
    return RUNTIME_MARKERS.every((marker) => fs.statSync(path.join(directory, marker)).isFile());
  } catch {
    return false;
  }
}

export function resolveCareerOsRuntimeDirectory({
  explicitDirectory,
  appPath,
  homeDirectory,
}: RuntimeDirectoryOptions) {
  const attemptedPaths = uniquePaths([
    explicitDirectory,
    path.resolve(appPath, '..', '..', '..', 'careeros-jobs'),
    path.resolve(appPath, '..', 'careeros-jobs'),
    path.join(homeDirectory, 'Documents', 'Playground', 'careeros-jobs'),
  ]);
  const matchedPath = attemptedPaths.find(isCareerOsRuntimeDirectory);
  return {
    directory: matchedPath ? fs.realpathSync(matchedPath) : undefined,
    attemptedPaths,
  };
}

async function checkApi(fetchFn: FetchFunction): Promise<HealthCheck> {
  try {
    const response = await fetchFn(CAREEROS_API_READY_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) return { ready: false, detail: `http_${response.status}` };
    const payload = (await response.json()) as { status?: unknown };
    return payload.status === 'ready'
      ? { ready: true, detail: 'ready' }
      : { ready: false, detail: 'unexpected_status' };
  } catch (error) {
    return { ready: false, detail: error instanceof Error ? error.message : 'request_failed' };
  }
}

async function checkWeb(fetchFn: FetchFunction): Promise<HealthCheck> {
  try {
    const response = await fetchFn(CAREEROS_WEB_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(3_000),
    });
    return {
      ready: response.ok,
      detail: `http_${response.status}`,
    };
  } catch (error) {
    return { ready: false, detail: error instanceof Error ? error.message : 'request_failed' };
  }
}

export async function checkCareerOsHealth({ fetchFn = fetch }: { fetchFn?: FetchFunction } = {}) {
  const [api, web] = await Promise.all([checkApi(fetchFn), checkWeb(fetchFn)]);
  return { api, web, ready: api.ready && web.ready };
}

export function runCareerOsLauncher(scriptPath: string, workingDirectory: string) {
  return new Promise<void>((resolve, reject) => {
    if (process.platform !== 'win32') {
      reject(new Error('Automatic CareerOS startup currently requires Windows PowerShell.'));
      return;
    }

    const child = spawn(
      'powershell.exe',
      ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', scriptPath, '-NoBrowser'],
      {
        cwd: workingDirectory,
        shell: false,
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('CareerOS startup timed out after 120 seconds.'));
    }, 120_000);

    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve();
      else reject(new Error(`CareerOS startup exited with code ${code ?? 'unknown'}.`));
    });
  });
}

export async function ensureCareerOsRuntime({
  autostart,
  explicitDirectory,
  appPath,
  homeDirectory,
  fetchFn = fetch,
  runLauncher = runCareerOsLauncher,
}: EnsureCareerOsRuntimeOptions): Promise<CareerOsRuntimeResult> {
  const initialHealth = await checkCareerOsHealth({ fetchFn });
  if (initialHealth.ready) {
    return { status: 'ready', action: 'reused', health: initialHealth };
  }

  if (!autostart) {
    return {
      status: 'unavailable',
      action: 'disabled',
      health: initialHealth,
      guidance:
        'CareerOS autostart is disabled by CAREEROS_AUTOSTART. Start CareerOS manually or remove that override, then reopen Desktop.',
    };
  }

  const discovery = resolveCareerOsRuntimeDirectory({ explicitDirectory, appPath, homeDirectory });
  if (!discovery.directory) {
    return {
      status: 'unavailable',
      action: 'not_found',
      health: initialHealth,
      guidance: `CareerOS could not find a complete careeros-jobs checkout. Set CAREEROS_JOBS_DIR to the checkout and reopen Desktop. Checked: ${discovery.attemptedPaths.join(', ')}`,
    };
  }

  try {
    await runLauncher(path.join(discovery.directory, 'scripts', 'start-careeros.ps1'), discovery.directory);
    const health = await checkCareerOsHealth({ fetchFn });
    if (!health.ready) {
      throw new Error(
        `startup completed but health remained unavailable (API: ${health.api.detail}; web: ${health.web.detail})`,
      );
    }
    return {
      status: 'ready',
      action: 'started',
      health,
      runtimeDirectory: discovery.directory,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      status: 'unavailable',
      action: 'failed',
      health: await checkCareerOsHealth({ fetchFn }),
      runtimeDirectory: discovery.directory,
      guidance: `CareerOS did not start: ${detail} Check ${path.join(discovery.directory, '.runtime')} for API and web logs. Desktop will use its bundled fallback.`,
    };
  }
}
