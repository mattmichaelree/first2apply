import { afterEach, describe, expect, it } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { ProtectedStorage, ProviderCredentialAuditEvent, ProviderCredentialStore } from './providerCredentials';

const temporaryDirectories: string[] = [];

function createTemporaryDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'careeros-provider-credentials-test-'));
  temporaryDirectories.push(directory);
  return directory;
}

function createProtectedStorage(available = true): ProtectedStorage {
  return {
    isEncryptionAvailable: () => available,
    encryptString: (value) => Buffer.from(value.split('').reverse().join(''), 'utf8'),
    decryptString: (value) => value.toString('utf8').split('').reverse().join(''),
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('local provider credential storage', () => {
  it('encrypts saved values and exposes only redacted status and audit metadata', () => {
    const directory = createTemporaryDirectory();
    const auditEvents: ProviderCredentialAuditEvent[] = [];
    const secret = 'apify-never-render-or-log';
    const store = new ProviderCredentialStore({
      directory,
      protectedStorage: createProtectedStorage(),
      audit: (event) => auditEvents.push(event),
    });

    const overview = store.save('apify', { apiToken: secret });
    const persisted = fs.readFileSync(path.join(directory, 'apify.bin'));

    expect(persisted.toString('utf8')).not.toContain(secret);
    expect(JSON.stringify(overview)).not.toContain(secret);
    expect(JSON.stringify(auditEvents)).not.toContain(secret);
    expect(overview.providers.find((provider) => provider.id === 'apify')).toMatchObject({
      configured: true,
      statusText: 'Configured (redacted)',
      fields: [{ id: 'apiToken', configured: true, displayValue: '••••••••' }],
    });
    expect(auditEvents).toEqual([{ action: 'saved', providerId: 'apify' }]);
  });

  it('injects only configured provider values under their allowlisted environment names', () => {
    const store = new ProviderCredentialStore({
      directory: createTemporaryDirectory(),
      protectedStorage: createProtectedStorage(),
    });
    store.save('apollo', { apiKey: 'apollo-selected' });
    store.save('resend', { apiKey: 'resend-selected', fromEmail: 'CareerOS <alerts@example.test>' });

    expect(store.getEnvironment()).toEqual({
      CAREEROS_JOBS_APOLLO_API_KEY: 'apollo-selected',
      CAREEROS_JOBS_RESEND_API_KEY: 'resend-selected',
      CAREEROS_JOBS_RESEND_FROM_EMAIL: 'CareerOS <alerts@example.test>',
    });
  });

  it('replaces an existing encrypted value without retaining the previous secret', () => {
    const store = new ProviderCredentialStore({
      directory: createTemporaryDirectory(),
      protectedStorage: createProtectedStorage(),
    });
    store.save('apify', { apiToken: 'first-secret' });

    store.save('apify', { apiToken: 'replacement-secret' });

    expect(store.getEnvironment()).toEqual({ CAREEROS_JOBS_APIFY_API_TOKEN: 'replacement-secret' });
  });

  it('removes one provider without exposing or deleting another provider', () => {
    const directory = createTemporaryDirectory();
    const store = new ProviderCredentialStore({
      directory,
      protectedStorage: createProtectedStorage(),
    });
    store.save('apify', { apiToken: 'apify-secret' });
    store.save('exa', { apiKey: 'exa-secret' });

    const overview = store.remove('apify');

    expect(fs.existsSync(path.join(directory, 'apify.bin'))).toBe(false);
    expect(fs.existsSync(path.join(directory, 'exa.bin'))).toBe(true);
    expect(store.getEnvironment()).toEqual({ CAREEROS_JOBS_EXA_API_KEY: 'exa-secret' });
    expect(overview.providers.find((provider) => provider.id === 'apify')).toMatchObject({
      configured: false,
      statusText: 'Not configured',
    });
  });

  it('fails closed with clear status when OS protected storage is unavailable', () => {
    const store = new ProviderCredentialStore({
      directory: createTemporaryDirectory(),
      protectedStorage: createProtectedStorage(false),
    });

    expect(() => store.save('exa', { apiKey: 'must-not-write' })).toThrow('OS protected storage is unavailable');
    expect(store.getEnvironment()).toEqual({});
    expect(store.getOverview()).toMatchObject({
      storageAvailable: false,
      storageMessage: expect.stringContaining('OS protected storage is unavailable'),
    });
  });

  it.each(['basic_text', 'unknown'])(
    'rejects Electron %s backend because it is not OS protected storage',
    (backend) => {
      const insecureStorage = {
        ...createProtectedStorage(),
        getSelectedStorageBackend: () => backend,
      } as ProtectedStorage;
      const store = new ProviderCredentialStore({
        directory: createTemporaryDirectory(),
        protectedStorage: insecureStorage,
        platform: 'linux',
      });

      expect(() => store.save('apollo', { apiKey: 'must-not-write' })).toThrow('OS protected storage is unavailable');
      expect(store.getEnvironment()).toEqual({});
    },
  );

  it('does not inject malformed decrypted payloads and marks them for removal', () => {
    const directory = createTemporaryDirectory();
    const protectedStorage = createProtectedStorage();
    fs.writeFileSync(
      path.join(directory, 'exa.bin'),
      protectedStorage.encryptString(JSON.stringify({ version: 1, providerId: 'exa', values: 42 })),
    );
    const store = new ProviderCredentialStore({ directory, protectedStorage });

    expect(store.getEnvironment()).toEqual({});
    expect(store.getOverview().providers.find((provider) => provider.id === 'exa')).toMatchObject({
      configured: false,
      canRemove: true,
      statusText: 'Encrypted value could not be read; remove and add again',
    });
  });

  it('rejects unknown providers and unexpected fields before writing', () => {
    const directory = createTemporaryDirectory();
    const store = new ProviderCredentialStore({
      directory,
      protectedStorage: createProtectedStorage(),
    });

    expect(() => store.save('unknown', { apiKey: 'secret' })).toThrow('Unknown provider');
    expect(() => store.save('apify', { apiToken: 'secret', extra: 'must-not-persist' })).toThrow(
      'Unexpected credential field',
    );
    expect(fs.readdirSync(directory)).toEqual([]);
  });
});
