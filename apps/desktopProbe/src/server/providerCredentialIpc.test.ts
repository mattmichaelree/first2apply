import { afterEach, describe, expect, it } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { IpcRegistrar, initProviderCredentialIpc } from './providerCredentialIpc';
import { ProtectedStorage, ProviderCredentialStore } from './providerCredentials';

const temporaryDirectories: string[] = [];

function createTemporaryDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'careeros-provider-ipc-test-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function protectedStorage(): ProtectedStorage {
  return {
    isEncryptionAvailable: () => true,
    encryptString: (value) => Buffer.from(value.split('').reverse().join('')),
    decryptString: (value) => value.toString().split('').reverse().join(''),
  };
}

function createRegistrar() {
  const handlers = new Map<string, (event: unknown, input?: unknown) => unknown>();
  const registrar: IpcRegistrar = {
    handle: (channel, handler) => {
      handlers.set(channel, handler);
    },
  };
  return { handlers, registrar };
}

describe('provider credential IPC', () => {
  it('returns only redacted status after saving a secret', async () => {
    const { handlers, registrar } = createRegistrar();
    const store = new ProviderCredentialStore({
      directory: createTemporaryDirectory(),
      protectedStorage: protectedStorage(),
    });
    const secret = `ipc-secret-${Date.now()}`;
    initProviderCredentialIpc({ registrar, store, isAllowedSender: () => true });

    const response = await handlers.get('provider-credentials:save')?.(
      {},
      { providerId: 'apify', values: { apiToken: secret } },
    );

    expect(JSON.stringify(response)).not.toContain(secret);
    expect(response).toMatchObject({
      data: {
        providers: expect.arrayContaining([
          expect.objectContaining({ id: 'apify', statusText: 'Configured (redacted)' }),
        ]),
      },
    });
  });

  it('rejects calls from any renderer other than the dedicated local settings window', async () => {
    const { handlers, registrar } = createRegistrar();
    const store = new ProviderCredentialStore({
      directory: createTemporaryDirectory(),
      protectedStorage: protectedStorage(),
    });
    initProviderCredentialIpc({ registrar, store, isAllowedSender: () => false });

    await expect(handlers.get('provider-credentials:list')?.({})).resolves.toEqual({
      error: 'Provider credential settings are available only in the local settings window.',
    });
  });
});
