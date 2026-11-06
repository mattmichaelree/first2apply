import {
  DEFAULT_OPENROUTER_MODEL,
  OpenRouterModel,
  OpenRouterRequestConfig,
  OpenRouterSettingsStatus,
  parseOpenRouterModel,
} from '@careeros/core';
import { safeStorage } from 'electron';
import fs from 'fs';

type StoredOpenRouterSettings = {
  readonly apiKey: string;
  readonly model: OpenRouterModel;
};

export class OpenRouterSettingsStore {
  constructor(private readonly settingsPath: string) {}

  getStatus(): OpenRouterSettingsStatus {
    const settings = this.read();
    return {
      isConfigured: settings !== undefined,
      model: settings?.model ?? DEFAULT_OPENROUTER_MODEL,
    };
  }

  getRequestConfig(): OpenRouterRequestConfig | undefined {
    return this.read();
  }

  save({ apiKey, model }: { readonly apiKey?: string; readonly model: unknown }): OpenRouterSettingsStatus {
    const parsedModel = parseOpenRouterModel(model);
    const existingKey = this.read()?.apiKey;
    const nextKey = apiKey?.trim() || existingKey;
    if (!nextKey) {
      throw new Error('Enter an OpenRouter API key before saving.');
    }
    if (!nextKey.startsWith('sk-or-')) {
      throw new Error('OpenRouter API keys must start with sk-or-.');
    }
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Secure credential storage is not available on this computer.');
    }

    const encrypted = safeStorage.encryptString(JSON.stringify({ apiKey: nextKey, model: parsedModel }));
    fs.writeFileSync(this.settingsPath, encrypted.toString('base64'), { encoding: 'utf-8', mode: 0o600 });
    return { isConfigured: true, model: parsedModel };
  }

  remove(): OpenRouterSettingsStatus {
    if (fs.existsSync(this.settingsPath)) {
      fs.unlinkSync(this.settingsPath);
    }
    return { isConfigured: false, model: DEFAULT_OPENROUTER_MODEL };
  }

  private read(): StoredOpenRouterSettings | undefined {
    if (!fs.existsSync(this.settingsPath)) {
      return undefined;
    }
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Secure credential storage is not available on this computer.');
    }

    const encrypted = fs.readFileSync(this.settingsPath, 'utf-8');
    const plaintext = safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
    const parsed: unknown = JSON.parse(plaintext);
    if (!isStoredSettings(parsed)) {
      throw new Error('Saved OpenRouter settings are invalid.');
    }
    return { apiKey: parsed.apiKey, model: parseOpenRouterModel(parsed.model) };
  }
}

function isStoredSettings(value: unknown): value is { readonly apiKey: string; readonly model: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'apiKey' in value &&
    typeof value.apiKey === 'string' &&
    'model' in value
  );
}
