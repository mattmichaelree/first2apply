import fs from 'fs';
import path from 'path';

export type ProtectedStorage = {
  isEncryptionAvailable(): boolean;
  getSelectedStorageBackend?(): string;
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
};

export type ProviderCredentialAuditEvent = {
  action: 'saved' | 'removed';
  providerId: string;
};

type ProviderCredentialField = {
  id: string;
  label: string;
  environmentVariable: string;
  inputType: 'password' | 'email' | 'text';
};

type ProviderCredentialDefinition = {
  id: string;
  label: string;
  description: string;
  fields: readonly ProviderCredentialField[];
};

export const PROVIDER_CREDENTIAL_DEFINITIONS: readonly ProviderCredentialDefinition[] = [
  {
    id: 'apify',
    label: 'Apify',
    description: 'Optional bounded job discovery and company research.',
    fields: [
      {
        id: 'apiToken',
        label: 'API token',
        environmentVariable: 'CAREEROS_JOBS_APIFY_API_TOKEN',
        inputType: 'password',
      },
    ],
  },
  {
    id: 'apollo',
    label: 'Apollo',
    description: 'Optional company and people research.',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        environmentVariable: 'CAREEROS_JOBS_APOLLO_API_KEY',
        inputType: 'password',
      },
    ],
  },
  {
    id: 'crunchbase',
    label: 'Crunchbase',
    description: 'Optional company and funding research.',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        environmentVariable: 'CAREEROS_JOBS_CRUNCHBASE_API_KEY',
        inputType: 'password',
      },
    ],
  },
  {
    id: 'exa',
    label: 'Exa',
    description: 'Optional research provider.',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        environmentVariable: 'CAREEROS_JOBS_EXA_API_KEY',
        inputType: 'password',
      },
    ],
  },
  {
    id: 'career_memory',
    label: 'Career Memory',
    description: 'Private read-only role, bullet, achievement, and career-context sync.',
    fields: [
      {
        id: 'origin',
        label: 'Private gateway URL',
        environmentVariable: 'CAREEROS_JOBS_CAREER_MEMORY_ORIGIN',
        inputType: 'text',
      },
      {
        id: 'username',
        label: 'Gateway username',
        environmentVariable: 'CAREEROS_JOBS_CAREER_MEMORY_USERNAME',
        inputType: 'text',
      },
      {
        id: 'password',
        label: 'Gateway password',
        environmentVariable: 'CAREEROS_JOBS_CAREER_MEMORY_PASSWORD',
        inputType: 'password',
      },
    ],
  },
  {
    id: 'resend',
    label: 'Resend',
    description: 'Optional system notification delivery.',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        environmentVariable: 'CAREEROS_JOBS_RESEND_API_KEY',
        inputType: 'password',
      },
      {
        id: 'fromEmail',
        label: 'From email',
        environmentVariable: 'CAREEROS_JOBS_RESEND_FROM_EMAIL',
        inputType: 'text',
      },
    ],
  },
  {
    id: 'gmail_oauth',
    label: 'Gmail OAuth',
    description: 'Optional recruiter outreach behind CareerOS preview, approval, and send gates.',
    fields: [
      {
        id: 'accessToken',
        label: 'OAuth access token',
        environmentVariable: 'CAREEROS_JOBS_GMAIL_OAUTH_ACCESS_TOKEN',
        inputType: 'password',
      },
      {
        id: 'senderEmail',
        label: 'Sender email',
        environmentVariable: 'CAREEROS_JOBS_GMAIL_SENDER_EMAIL',
        inputType: 'email',
      },
    ],
  },
] as const;

export const PROVIDER_ENVIRONMENT_KEYS = new Set(
  PROVIDER_CREDENTIAL_DEFINITIONS.flatMap((provider) => provider.fields.map((field) => field.environmentVariable)),
);

export type ProviderCredentialOverview = {
  storageAvailable: boolean;
  storageMessage: string;
  providers: Array<{
    id: string;
    label: string;
    description: string;
    configured: boolean;
    canRemove: boolean;
    statusText: string;
    fields: Array<{
      id: string;
      label: string;
      inputType: 'password' | 'email' | 'text';
      configured: boolean;
      displayValue: string;
    }>;
  }>;
};

type ProviderCredentialStoreOptions = {
  directory: string;
  protectedStorage: ProtectedStorage;
  platform?: NodeJS.Platform;
  audit?: (event: ProviderCredentialAuditEvent) => void;
};

type StoredProviderCredentials = {
  version: 1;
  providerId: string;
  values: Record<string, string>;
};

type ReadResult =
  | { state: 'missing' }
  | { state: 'unavailable' }
  | { state: 'unreadable' }
  | { state: 'ready'; values: Record<string, string> };

const STORAGE_UNAVAILABLE_MESSAGE =
  'OS protected storage is unavailable. CareerOS will not save or inject provider credentials on this device.';

function getProviderDefinition(providerId: string) {
  const definition = PROVIDER_CREDENTIAL_DEFINITIONS.find((provider) => provider.id === providerId);
  if (!definition) throw new Error(`Unknown provider: ${providerId}`);
  return definition;
}

export class ProviderCredentialStore {
  private readonly directory: string;
  private readonly protectedStorage: ProtectedStorage;
  private readonly platform: NodeJS.Platform;
  private readonly audit?: (event: ProviderCredentialAuditEvent) => void;

  constructor({ directory, protectedStorage, platform = process.platform, audit }: ProviderCredentialStoreOptions) {
    this.directory = directory;
    this.protectedStorage = protectedStorage;
    this.platform = platform;
    this.audit = audit;
  }

  save(providerId: string, suppliedValues: Record<string, string>): ProviderCredentialOverview {
    const definition = getProviderDefinition(providerId);
    if (!this.isProtectedStorageAvailable()) throw new Error(STORAGE_UNAVAILABLE_MESSAGE);

    const allowedFields = new Set(definition.fields.map((field) => field.id));
    const unexpectedField = Object.keys(suppliedValues).find((field) => !allowedFields.has(field));
    if (unexpectedField) throw new Error(`Unexpected credential field: ${unexpectedField}`);

    const existing = this.read(providerId);
    const previousValues = existing.state === 'ready' ? existing.values : {};
    const values = Object.fromEntries(
      definition.fields.map((field) => {
        const suppliedValue = suppliedValues[field.id]?.trim();
        const value = suppliedValue || previousValues[field.id];
        if (!value) throw new Error(`${field.label} is required for ${definition.label}.`);
        return [field.id, value];
      }),
    );
    const payload: StoredProviderCredentials = { version: 1, providerId, values };
    const encrypted = this.protectedStorage.encryptString(JSON.stringify(payload));

    fs.mkdirSync(this.directory, { recursive: true });
    const destination = this.filePath(providerId);
    const temporaryPath = `${destination}.${process.pid}.tmp`;
    try {
      fs.writeFileSync(temporaryPath, encrypted, { mode: 0o600 });
      fs.renameSync(temporaryPath, destination);
    } finally {
      if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    }

    this.audit?.({ action: 'saved', providerId });
    return this.getOverview();
  }

  remove(providerId: string): ProviderCredentialOverview {
    getProviderDefinition(providerId);
    const credentialPath = this.filePath(providerId);
    if (fs.existsSync(credentialPath)) fs.unlinkSync(credentialPath);
    this.audit?.({ action: 'removed', providerId });
    return this.getOverview();
  }

  getEnvironment(): NodeJS.ProcessEnv {
    if (!this.isProtectedStorageAvailable()) return {};

    const environment: NodeJS.ProcessEnv = {};
    for (const provider of PROVIDER_CREDENTIAL_DEFINITIONS) {
      const result = this.read(provider.id);
      if (result.state !== 'ready') continue;
      for (const field of provider.fields) {
        const value = result.values[field.id];
        if (value) environment[field.environmentVariable] = value;
      }
    }
    return environment;
  }

  getOverview(): ProviderCredentialOverview {
    const storageAvailable = this.isProtectedStorageAvailable();
    return {
      storageAvailable,
      storageMessage: storageAvailable
        ? 'Credentials are encrypted with OS protected storage and are available only to the local CareerOS process.'
        : STORAGE_UNAVAILABLE_MESSAGE,
      providers: PROVIDER_CREDENTIAL_DEFINITIONS.map((provider) => {
        const result = this.read(provider.id);
        const values = result.state === 'ready' ? result.values : {};
        const configured = provider.fields.every((field) => Boolean(values[field.id]));
        const canRemove = fs.existsSync(this.filePath(provider.id));
        const statusText =
          result.state === 'unavailable'
            ? 'Secure storage unavailable'
            : result.state === 'unreadable'
              ? 'Encrypted value could not be read; remove and add again'
              : configured
                ? 'Configured (redacted)'
                : 'Not configured';
        return {
          id: provider.id,
          label: provider.label,
          description: provider.description,
          configured,
          canRemove,
          statusText,
          fields: provider.fields.map((field) => ({
            id: field.id,
            label: field.label,
            inputType: field.inputType,
            configured: Boolean(values[field.id]),
            displayValue: values[field.id] ? '••••••••' : 'Not configured',
          })),
        };
      }),
    };
  }

  private filePath(providerId: string) {
    return path.join(this.directory, `${providerId}.bin`);
  }

  private read(providerId: string): ReadResult {
    const definition = getProviderDefinition(providerId);
    const credentialPath = this.filePath(providerId);
    if (!fs.existsSync(credentialPath)) return { state: 'missing' };
    if (!this.isProtectedStorageAvailable()) return { state: 'unavailable' };

    try {
      const plaintext = this.protectedStorage.decryptString(fs.readFileSync(credentialPath));
      const payload = JSON.parse(plaintext) as Partial<StoredProviderCredentials>;
      if (
        payload.version !== 1 ||
        payload.providerId !== providerId ||
        !payload.values ||
        typeof payload.values !== 'object' ||
        Array.isArray(payload.values)
      ) {
        return { state: 'unreadable' };
      }
      const expectedFields = new Set(definition.fields.map((field) => field.id));
      if (
        Object.keys(payload.values).some((field) => !expectedFields.has(field)) ||
        Object.values(payload.values).some((value) => typeof value !== 'string')
      ) {
        return { state: 'unreadable' };
      }
      return { state: 'ready', values: payload.values };
    } catch {
      return { state: 'unreadable' };
    }
  }

  private isProtectedStorageAvailable() {
    if (!this.protectedStorage.isEncryptionAvailable()) return false;
    if (this.platform !== 'linux') return true;
    const backend = this.protectedStorage.getSelectedStorageBackend?.();
    return new Set(['gnome_libsecret', 'kwallet', 'kwallet5', 'kwallet6']).has(backend ?? 'unknown');
  }
}
