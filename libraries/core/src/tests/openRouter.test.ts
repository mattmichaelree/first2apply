import { describe, expect, test } from '@jest/globals';

import { DEFAULT_OPENROUTER_MODEL, parseOpenRouterModel } from '../openRouter';

describe('OpenRouter model selection', () => {
  test('uses DeepSeek V4 Flash when no model is configured', () => {
    expect(parseOpenRouterModel(undefined)).toBe(DEFAULT_OPENROUTER_MODEL);
  });

  test('accepts every model exposed by the app', () => {
    expect(parseOpenRouterModel('deepseek/deepseek-v4-flash')).toBe('deepseek/deepseek-v4-flash');
    expect(parseOpenRouterModel('deepseek/deepseek-v4-pro')).toBe('deepseek/deepseek-v4-pro');
  });

  test('rejects a model outside the allowlist', () => {
    expect(() => parseOpenRouterModel('untrusted/model')).toThrow('Unsupported OpenRouter model');
  });
});
