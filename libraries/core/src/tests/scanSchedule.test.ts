import { describe, expect, it } from '@jest/globals';

import { getCronIntervalMs, getScanJitterMs, isScanDue } from '../scanSchedule';

describe('scan schedule', () => {
  it('uses a four-hour interval for the LinkedIn rule', () => {
    // Given
    const cronRule = '0 */4 * * *';

    // When
    const interval = getCronIntervalMs(cronRule);

    // Then
    expect(interval).toBe(4 * 60 * 60 * 1000);
  });

  it('keeps jitter stable for the same completed scan', () => {
    // Given
    const linkId = 42;
    const lastScrapedAt = '2026-10-08T08:00:00.000Z';

    // When
    const first = getScanJitterMs({ linkId, lastScrapedAt, maxJitterMinutes: 20 });
    const second = getScanJitterMs({ linkId, lastScrapedAt, maxJitterMinutes: 20 });

    // Then
    expect(first).toBe(second);
    expect(Math.abs(first)).toBeLessThanOrEqual(20 * 60 * 1000);
  });

  it('waits for the randomized interval before scanning', () => {
    // Given
    const lastScrapedAt = '2026-10-08T08:00:00.000Z';
    const intervalMs = 4 * 60 * 60 * 1000;
    const jitterMs = 15 * 60 * 1000;

    // When
    const early = isScanDue({ lastScrapedAt, intervalMs, jitterMs, nowMs: Date.parse('2026-10-08T12:14:00.000Z') });
    const due = isScanDue({ lastScrapedAt, intervalMs, jitterMs, nowMs: Date.parse('2026-10-08T12:15:00.000Z') });

    // Then
    expect(early).toBe(false);
    expect(due).toBe(true);
  });
});
