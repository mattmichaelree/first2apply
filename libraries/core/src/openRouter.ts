export const OPENROUTER_MODELS = [
  {
    id: 'deepseek/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
  },
  {
    id: 'deepseek/deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
  },
] as const;

export type OpenRouterModel = (typeof OPENROUTER_MODELS)[number]['id'];

export const DEFAULT_OPENROUTER_MODEL: OpenRouterModel = 'deepseek/deepseek-v4-flash';

export type OpenRouterSettingsStatus = {
  readonly isConfigured: boolean;
  readonly model: OpenRouterModel;
};

export type OpenRouterRequestConfig = {
  readonly apiKey: string;
  readonly model: OpenRouterModel;
};

export function parseOpenRouterModel(value: unknown): OpenRouterModel {
  if (value === undefined) {
    return DEFAULT_OPENROUTER_MODEL;
  }

  const model = OPENROUTER_MODELS.find((candidate) => candidate.id === value);
  if (!model) {
    throw new Error('Unsupported OpenRouter model');
  }

  return model.id;
}
