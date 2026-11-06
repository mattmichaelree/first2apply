import { describe, expect, it, jest } from '@jest/globals';

import {
  JOB_SWEEP_EXTENSION_ID,
  getJobSweepExtensionPaths,
  getJobSweepPackageResources,
  loadJobSweepExtension,
} from './jobSweepExtension';

describe('Job Sweep desktop extension loader', () => {
  it('stays disabled when no local extension path is configured', async () => {
    const loadExtension = jest.fn<(extensionPath: string) => Promise<{ id: string; name: string; version: string }>>();

    const result = await loadJobSweepExtension({
      extensionPaths: [],
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
      extensionPaths: ['C:\\extensions\\configured', 'C:\\resources\\job-sweep-chrome', 'C:\\development\\job-sweep'],
      manifestExists: () => true,
      loadExtension,
      removeExtension: jest.fn(),
      onFailure: jest.fn(),
    });

    expect(result).toEqual({ status: 'loaded', extension });
    expect(loadExtension).toHaveBeenCalledWith('C:\\extensions\\configured');
  });

  it('loads the packaged bundle when the configured path is absent', async () => {
    const extension = { id: JOB_SWEEP_EXTENSION_ID, name: 'Job Sweep', version: '8.3.0' };
    const loadedPaths: string[] = [];

    const result = await loadJobSweepExtension({
      extensionPaths: ['C:\\extensions\\missing', 'C:\\resources\\job-sweep-chrome', 'C:\\development\\job-sweep'],
      manifestExists: (extensionPath) => extensionPath === 'C:\\resources\\job-sweep-chrome',
      loadExtension: async (extensionPath) => {
        loadedPaths.push(extensionPath);
        return extension;
      },
      removeExtension: jest.fn(),
      onFailure: jest.fn(),
    });

    expect(result).toEqual({ status: 'loaded', extension });
    expect(loadedPaths).toEqual(['C:\\resources\\job-sweep-chrome']);
  });

  it('unloads and rejects a bundle with an unexpected extension id', async () => {
    const removeExtension = jest.fn();
    const onFailure = jest.fn();

    const result = await loadJobSweepExtension({
      extensionPaths: ['C:\\extensions\\wrong-extension', 'C:\\resources\\job-sweep-chrome'],
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
    const loadExtension = jest.fn<(extensionPath: string) => Promise<{ id: string; name: string; version: string }>>();
    const onFailure = jest.fn();

    const result = await loadJobSweepExtension({
      extensionPaths: ['C:\\extensions\\missing'],
      manifestExists: () => false,
      loadExtension,
      removeExtension: jest.fn(),
      onFailure,
    });

    expect(result.status).toBe('unavailable');
    expect(loadExtension).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('derives packaged and development candidates without an absolute user path', () => {
    expect(
      getJobSweepExtensionPaths({
        configuredPath: ' C:\\extensions\\configured ',
        resourcesPath: 'C:\\CareerOS\\resources',
        appPath: 'C:\\workspace\\first2apply\\apps\\desktopProbe',
      }),
    ).toEqual([
      'C:\\extensions\\configured',
      'C:\\CareerOS\\resources\\job-sweep-chrome',
      'C:\\workspace\\job-sweep\\dist\\bundles\\chrome',
    ]);
  });

  it('includes the canonical Job Sweep bundle only when its manifest exists', () => {
    const present = getJobSweepPackageResources({
      desktopRoot: 'C:\\workspace\\first2apply\\apps\\desktopProbe',
      manifestExists: (manifestPath) =>
        manifestPath === 'C:\\workspace\\job-sweep\\dist\\job-sweep-chrome\\manifest.json',
    });
    const absent = getJobSweepPackageResources({
      desktopRoot: 'C:\\workspace\\first2apply\\apps\\desktopProbe',
      manifestExists: () => false,
    });

    expect(present).toEqual(['C:\\workspace\\job-sweep\\dist\\job-sweep-chrome']);
    expect(absent).toEqual([]);
  });
});
