import { DEFAULT_CAREEROS_WEB_URL, getCareerOsAutostart, getCareerOsWebUrl } from './env';

import { describe, expect, it } from '@jest/globals';

describe('CareerOS web host configuration', () => {
  it('defaults to the canonical local CareerOS web app', () => {
    expect(getCareerOsWebUrl(DEFAULT_CAREEROS_WEB_URL)).toBe('http://127.0.0.1:5174/');
  });

  it('uses a configured HTTP(S) CareerOS web URL', () => {
    expect(getCareerOsWebUrl(' http://127.0.0.1:5174 ')).toBe('http://127.0.0.1:5174/');
  });

  it.each([
    '',
    'careeros.example.test',
    'file:///C:/careeros/index.html',
    'https://careeros.example.test',
    'http://192.168.1.5:5174',
  ])('ignores unsupported or non-loopback web URL %p', (url) => {
    expect(getCareerOsWebUrl(url)).toBeUndefined();
  });
});

describe('CareerOS local runtime configuration', () => {
  it.each([undefined, '', '1', 'true', 'yes'])('keeps local autostart enabled for %p', (value) => {
    expect(getCareerOsAutostart(value)).toBe(true);
  });

  it.each(['0', 'false', 'no', 'off'])('allows a reversible autostart opt-out with %p', (value) => {
    expect(getCareerOsAutostart(value)).toBe(false);
  });
});
