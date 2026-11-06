import { ProviderCredentialStore } from './providerCredentials';

export type IpcRegistrar = {
  handle(channel: string, handler: (event: unknown, input?: unknown) => unknown): void;
};

export function initProviderCredentialIpc(_options: {
  registrar: IpcRegistrar;
  store: ProviderCredentialStore;
  isAllowedSender: (event: unknown) => boolean;
}) {
  const { registrar, store, isAllowedSender } = _options;
  const call = async <T>(event: unknown, operation: () => T) => {
    if (!isAllowedSender(event)) {
      return { error: 'Provider credential settings are available only in the local settings window.' };
    }
    try {
      return { data: operation() };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Provider credential operation failed.' };
    }
  };

  registrar.handle('provider-credentials:list', (event) => call(event, () => store.getOverview()));
  registrar.handle('provider-credentials:save', (event, input) =>
    call(event, () => {
      if (!input || typeof input !== 'object') throw new Error('Invalid provider credential request.');
      const { providerId, values } = input as { providerId?: unknown; values?: unknown };
      if (typeof providerId !== 'string' || !values || typeof values !== 'object' || Array.isArray(values)) {
        throw new Error('Invalid provider credential request.');
      }
      return store.save(providerId, values as Record<string, string>);
    }),
  );
  registrar.handle('provider-credentials:remove', (event, input) =>
    call(event, () => {
      if (!input || typeof input !== 'object') throw new Error('Invalid provider credential request.');
      const { providerId } = input as { providerId?: unknown };
      if (typeof providerId !== 'string') throw new Error('Invalid provider credential request.');
      return store.remove(providerId);
    }),
  );
}
