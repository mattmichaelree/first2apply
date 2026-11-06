import { describe, expect, it, jest } from '@jest/globals';

import { restoreSavedSession } from './savedSession';

describe('saved cloud session restore', () => {
  it('continues without touching auth when no saved session exists', async () => {
    const setSession = jest.fn<() => Promise<{ error: Error | null }>>();

    const result = await restoreSavedSession({
      sessionPath: 'session.json',
      exists: () => false,
      read: () => 'unused',
      decrypt: () => 'unused',
      parse: JSON.parse,
      setSession,
      stopAutoRefresh: jest.fn(),
      onUnavailable: jest.fn(),
    });

    expect(result).toBe('not_found');
    expect(setSession).not.toHaveBeenCalled();
  });

  it('restores a valid saved session', async () => {
    const session = { access_token: 'access', refresh_token: 'refresh' };
    const setSession = jest.fn(async () => ({ error: null }));

    const result = await restoreSavedSession({
      sessionPath: 'session.json',
      exists: () => true,
      read: () => 'encrypted',
      decrypt: () => JSON.stringify(session),
      parse: JSON.parse,
      setSession,
      stopAutoRefresh: jest.fn(),
      onUnavailable: jest.fn(),
    });

    expect(result).toBe('restored');
    expect(setSession).toHaveBeenCalledWith(session);
  });

  it('keeps local CareerOS available when cloud auth cannot be reached', async () => {
    const error = new Error('AuthRetryableFetchError: fetch failed');
    const stopAutoRefresh = jest.fn();
    const onUnavailable = jest.fn();

    const result = await restoreSavedSession({
      sessionPath: 'session.json',
      exists: () => true,
      read: () => 'encrypted',
      decrypt: () => JSON.stringify({ access_token: 'access', refresh_token: 'refresh' }),
      parse: JSON.parse,
      setSession: async () => {
        throw error;
      },
      stopAutoRefresh,
      onUnavailable,
    });

    expect(result).toBe('unavailable');
    expect(stopAutoRefresh).toHaveBeenCalledTimes(1);
    expect(onUnavailable).toHaveBeenCalledWith(error);
  });

  it('treats an auth error result as recoverable startup degradation', async () => {
    const error = new Error('refresh token unavailable');
    const stopAutoRefresh = jest.fn();
    const onUnavailable = jest.fn();

    const result = await restoreSavedSession({
      sessionPath: 'session.json',
      exists: () => true,
      read: () => 'encrypted',
      decrypt: () => JSON.stringify({ access_token: 'access', refresh_token: 'refresh' }),
      parse: JSON.parse,
      setSession: async () => ({ error }),
      stopAutoRefresh,
      onUnavailable,
    });

    expect(result).toBe('unavailable');
    expect(stopAutoRefresh).toHaveBeenCalledTimes(1);
    expect(onUnavailable).toHaveBeenCalledWith(error);
  });

  it('does not hide malformed local session data as a network outage', async () => {
    const stopAutoRefresh = jest.fn();
    const onUnavailable = jest.fn();

    await expect(
      restoreSavedSession({
        sessionPath: 'session.json',
        exists: () => true,
        read: () => 'encrypted',
        decrypt: () => '{not-json',
        parse: JSON.parse,
        setSession: async () => ({ error: null }),
        stopAutoRefresh,
        onUnavailable,
      }),
    ).rejects.toThrow();

    expect(stopAutoRefresh).not.toHaveBeenCalled();
    expect(onUnavailable).not.toHaveBeenCalled();
  });
});
