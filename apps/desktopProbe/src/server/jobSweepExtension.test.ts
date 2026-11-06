import { describe, expect, it, jest } from '@jest/globals';

import { JOB_SWEEP_EXTENSION_ID, loadJobSweepExtension } from './jobSweepExtension';

describe('Job Sweep desktop extension loader', () => {
  it('stays disabled when no local extension path is configured', async () => {
    const loadExtension = jest.fn<
      (extensionPath: string) => Promise<{ id: string; name: string; version: string }>
    >();

    const result = await loadJobSweepExtension({
      extensionPath: undefined,
      manifestExists: () => false,
      loadExtension,
      removeExtension: jest.fn(),
      onFailure: jest.fn(),
    });

    expect(result).toEqual({ status: 'not_configured' });
    expect(loadExtension).not.toHaveBeenCalled();
  });

  it('loads the configured unpacked bundle only when its stable id matches', async () => {
    const extension = { id: JOB_SWEEP_EXTENSION_ID, name: 'Job Sweep', version: '8.3.0' };
    const loadExtension = jest.fn(async () => extension);

    const result = await loadJobSweepExtension({
      extensionPath: 'C:\\extensions\\job-sweep',
      manifestExists: () => true,
      loadExtension,
      removeExtension: jest.fn(),
      onFailure: jest.fn(),
    });

    expect(result).toEqual({ status: 'loaded', extension });
    expect(loadExtension).toHaveBeenCalledWith('C:\\extensions\\job-sweep');
  });

  it('unloads and rejects a bundle with an unexpected extension id', async () => {
    const removeExtension = jest.fn();
    const onFailure = jest.fn();

    const result = await loadJobSweepExtension({
      extensionPath: 'C:\\extensions\\wrong-extension',
      manifestExists: () => true,
      loadExtension: async () => ({ id: 'unexpected', name: 'Other', version: '1.0.0' }),
      removeExtension,
      onFailure,
    });

    expect(result.status).toBe('unavailable');
    expect(removeExtension).toHaveBeenCalledWith('unexpected');
    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('does not attempt to load a missing manifest', async () => {
    const loadExtension = jest.fn<
      (extensionPath: string) => Promise<{ id: string; name: string; version: string }>
    >();
    const onFailure = jest.fn();

    const result = await loadJobSweepExtension({
      extensionPath: 'C:\\extensions\\missing',
      manifestExists: () => false,
      loadExtension,
      removeExtension: jest.fn(),
      onFailure,
    });

    expect(result.status).toBe('unavailable');
    expect(loadExtension).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledTimes(1);
  });
});
