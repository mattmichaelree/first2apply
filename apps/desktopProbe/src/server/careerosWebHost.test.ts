import { describe, expect, it } from '@jest/globals';

import { isCareerOsWebNavigation, loadCareerOsWebHost, shouldExposeDesktopBridge } from './careerosWebHost';

describe('CareerOS web host', () => {
  it('does not expose the Electron bridge to the hosted CareerOS origin', () => {
    expect(shouldExposeDesktopBridge('http://127.0.0.1:5174/jobs', 'http://localhost:3000/main_window')).toBe(false);
    expect(shouldExposeDesktopBridge('http://localhost:3000/main_window', 'http://localhost:3000/main_window')).toBe(true);
    expect(shouldExposeDesktopBridge('https://example.test/popup', 'http://localhost:3000/main_window')).toBe(false);
    expect(shouldExposeDesktopBridge('http://localhost:3000/main_window', undefined)).toBe(false);
  });

  it('falls back to the bundled renderer when the configured web host fails to load', async () => {
    const configuredWebUrl = 'http://127.0.0.1:5174/';
    const bundledRendererUrl = 'http://localhost/main_window';
    const loadedUrls: string[] = [];
    const failures: unknown[] = [];

    await loadCareerOsWebHost({
      webUrl: configuredWebUrl,
      bundledRendererUrl,
      loadUrl: async (url) => {
        loadedUrls.push(url);
        if (url === configuredWebUrl) throw new Error('ECONNREFUSED');
      },
      onFailure: (error) => failures.push(error),
    });

    expect(loadedUrls).toEqual([configuredWebUrl, bundledRendererUrl]);
    expect(failures).toHaveLength(1);
  });

  it('keeps same-origin CareerOS web navigation inside the desktop window', () => {
    expect(isCareerOsWebNavigation('http://127.0.0.1:5174/jobs', 'http://127.0.0.1:5174/')).toBe(true);
    expect(isCareerOsWebNavigation('https://example.test/jobs', 'http://127.0.0.1:5174/')).toBe(false);
  });
});
