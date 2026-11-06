import { contextBridge, ipcRenderer } from 'electron';

import type { ProviderCredentialOverview } from './server/providerCredentials';

type ProviderCredentialResponse = { data?: ProviderCredentialOverview; error?: string };

contextBridge.exposeInMainWorld('providerCredentials', {
  list: (): Promise<ProviderCredentialResponse> => ipcRenderer.invoke('provider-credentials:list'),
  save: (providerId: string, values: Record<string, string>): Promise<ProviderCredentialResponse> =>
    ipcRenderer.invoke('provider-credentials:save', { providerId, values }),
  remove: (providerId: string): Promise<ProviderCredentialResponse> =>
    ipcRenderer.invoke('provider-credentials:remove', { providerId }),
});
