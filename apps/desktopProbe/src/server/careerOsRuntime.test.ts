import { afterEach, describe, expect, it, jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  CAREEROS_API_READY_URL,
  CAREEROS_WEB_URL,
  checkCareerOsHealth,
  ensureCareerOsRuntime,
  resolveCareerOsRuntimeDirectory,
} from './careerOsRuntime';

const temporaryDirectories: string[] = [];

function createTemporaryDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'careeros-desktop-test-'));
  temporaryDirectories.push(directory);
  return directory;
}

function createRuntimeFixture(directory: string) {
  fs.mkdirSync(path.join(directory, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'apps', 'web'), { recursive: true });
  fs.writeFileSync(path.join(directory, 'scripts', 'start-careeros.ps1'), '# fixture');
  fs.writeFileSync(path.join(directory, 'apps', 'web', 'package.json'), '{}');
  fs.writeFileSync(path.join(directory, 'pyproject.toml'), '[project]\nname = "careeros-jobs"');
}

function jsonResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  jest.restoreAllMocks();
});

describe('CareerOS runtime discovery', () => {
  it('finds the current checkout from the explicit override', () => {
    const runtime = path.join(createTemporaryDirectory(), 'careeros-jobs');
    createRuntimeFixture(runtime);

    expect(
      resolveCareerOsRuntimeDirectory({
        explicitDirectory: runtime,
        appPath: path.join(createTemporaryDirectory(), 'desktop'),
        homeDirectory: createTemporaryDirectory(),
      }).directory,
    ).toBe(fs.realpathSync(runtime));
  });

  it('finds the standard local checkout without a configured path', () => {
    const homeDirectory = createTemporaryDirectory();
    const runtime = path.join(homeDirectory, 'Documents', 'Playground', 'careeros-jobs');
    createRuntimeFixture(runtime);

    expect(
      resolveCareerOsRuntimeDirectory({
        appPath: path.join(createTemporaryDirectory(), 'desktop'),
        homeDirectory,
      }).directory,
    ).toBe(fs.realpathSync(runtime));
  });
});

describe('CareerOS runtime health', () => {
  it('requires the CareerOS ready payload and the web app', async () => {
    const fetchFn = jest.fn(async (url: string | URL | Request) => {
      if (String(url) === CAREEROS_API_READY_URL) return jsonResponse(200, { status: 'not-careeros' });
      if (String(url) === CAREEROS_WEB_URL) return jsonResponse(200, {});
      throw new Error(`unexpected URL ${String(url)}`);
    });

    await expect(checkCareerOsHealth({ fetchFn })).resolves.toEqual({
      api: { ready: false, detail: 'unexpected_status' },
      web: { ready: true, detail: 'http_200' },
      ready: false,
    });
  });

  it('reuses an already healthy API and web app without launching another runtime', async () => {
    const runLauncher = jest.fn(async () => undefined);
    const fetchFn = jest.fn(async (url: string | URL | Request) =>
      String(url) === CAREEROS_API_READY_URL
        ? jsonResponse(200, { status: 'ready' })
        : jsonResponse(200, {}),
    );

    await expect(
      ensureCareerOsRuntime({
        autostart: true,
        fetchFn,
        runLauncher,
        appPath: createTemporaryDirectory(),
        homeDirectory: createTemporaryDirectory(),
      }),
    ).resolves.toMatchObject({ status: 'ready', action: 'reused' });
    expect(runLauncher).not.toHaveBeenCalled();
  });

  it('starts the validated checkout and verifies health again', async () => {
    const runtime = path.join(createTemporaryDirectory(), 'careeros-jobs');
    createRuntimeFixture(runtime);
    let started = false;
    const runLauncher = jest.fn(async () => {
      started = true;
    });
    const fetchFn = jest.fn(async (url: string | URL | Request) => {
      if (!started) throw new Error('ECONNREFUSED');
      return String(url) === CAREEROS_API_READY_URL
        ? jsonResponse(200, { status: 'ready' })
        : jsonResponse(200, {});
    });

    await expect(
      ensureCareerOsRuntime({
        autostart: true,
        explicitDirectory: runtime,
        fetchFn,
        runLauncher,
        appPath: createTemporaryDirectory(),
        homeDirectory: createTemporaryDirectory(),
      }),
    ).resolves.toMatchObject({ status: 'ready', action: 'started', runtimeDirectory: fs.realpathSync(runtime) });
    expect(runLauncher).toHaveBeenCalledWith(
      path.join(fs.realpathSync(runtime), 'scripts', 'start-careeros.ps1'),
      fs.realpathSync(runtime),
    );
  });

  it('returns actionable fallback guidance when autostart is disabled', async () => {
    const fetchFn = jest.fn(async () => {
      throw new Error('ECONNREFUSED');
    });

    await expect(
      ensureCareerOsRuntime({
        autostart: false,
        fetchFn,
        runLauncher: jest.fn(async () => undefined),
        appPath: createTemporaryDirectory(),
        homeDirectory: createTemporaryDirectory(),
      }),
    ).resolves.toMatchObject({
      status: 'unavailable',
      action: 'disabled',
      guidance: expect.stringContaining('CAREEROS_AUTOSTART'),
    });
  });

  it('reports the runtime log directory when startup fails', async () => {
    const runtime = path.join(createTemporaryDirectory(), 'careeros-jobs');
    createRuntimeFixture(runtime);
    const fetchFn = jest.fn(async () => {
      throw new Error('ECONNREFUSED');
    });

    await expect(
      ensureCareerOsRuntime({
        autostart: true,
        explicitDirectory: runtime,
        fetchFn,
        runLauncher: async () => {
          throw new Error('launcher failed');
        },
        appPath: createTemporaryDirectory(),
        homeDirectory: createTemporaryDirectory(),
      }),
    ).resolves.toMatchObject({
      status: 'unavailable',
      action: 'failed',
      guidance: expect.stringContaining(path.join(fs.realpathSync(runtime), '.runtime')),
    });
  });
});
