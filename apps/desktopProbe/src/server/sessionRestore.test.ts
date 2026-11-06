import { afterEach, describe, expect, it, jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { restoreStoredSession } from './sessionRestore';

const temporaryDirectories: string[] = [];

function createSessionFile() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'careeros-session-test-'));
  temporaryDirectories.push(directory);
  const sessionPath = path.join(directory, 'session.json');
  fs.writeFileSync(sessionPath, Buffer.from('encrypted').toString('base64'), 'utf-8');
  return sessionPath;
}

function createDependencies(setSession: (session: Record<string, unknown>) => Promise<{ error: unknown | null }>) {
  return {
    protectedStorage: { decryptString: jest.fn(() => JSON.stringify({ access_token: 'token' })) },
    auth: { setSession: jest.fn(setSession) },
    logger: { info: jest.fn(), error: jest.fn() },
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('stored session restoration', () => {
  it('skips remote authentication when that service is disabled', async () => {
    const sessionPath = createSessionFile();
    const dependencies = createDependencies(async () => ({ error: null }));

    await expect(restoreStoredSession({ enabled: false, sessionPath, ...dependencies })).resolves.toBe(false);
    expect(dependencies.auth.setSession).not.toHaveBeenCalled();
  });

  it('keeps local CareerOS available when the remote session fetch fails', async () => {
    const sessionPath = createSessionFile();
    const dependencies = createDependencies(async () => {
      throw new Error('fetch failed');
    });

    await expect(restoreStoredSession({ enabled: true, sessionPath, ...dependencies })).resolves.toBe(false);
    expect(dependencies.logger.error).toHaveBeenCalledWith(
      'stored remote session could not be restored; continuing with local CareerOS: fetch failed',
    );
    expect(fs.existsSync(sessionPath)).toBe(true);
  });

  it('restores a valid remote session', async () => {
    const sessionPath = createSessionFile();
    const dependencies = createDependencies(async () => ({ error: null }));

    await expect(restoreStoredSession({ enabled: true, sessionPath, ...dependencies })).resolves.toBe(true);
    expect(dependencies.auth.setSession).toHaveBeenCalledWith({ access_token: 'token' });
  });
});
