const CRON_INTERVALS_MS = {
  '*/30 * * * *': 30 * 60 * 1000,
  '0 * * * *': 60 * 60 * 1000,
  '0 */2 * * *': 2 * 60 * 60 * 1000,
  '0 */4 * * *': 4 * 60 * 60 * 1000,
  '0 */8 * * *': 8 * 60 * 60 * 1000,
  '0 */12 * * *': 12 * 60 * 60 * 1000,
  '0 0 * * *': 24 * 60 * 60 * 1000,
  '0 0 */3 * *': 3 * 24 * 60 * 60 * 1000,
  '0 0 * * 0': 7 * 24 * 60 * 60 * 1000,
} as const;

export function getCronIntervalMs(cronRule: string | null | undefined): number | undefined {
  if (!cronRule || !Object.hasOwn(CRON_INTERVALS_MS, cronRule)) return undefined;
  return CRON_INTERVALS_MS[cronRule as keyof typeof CRON_INTERVALS_MS];
}

export function getScanJitterMs({
  linkId,
  lastScrapedAt,
  maxJitterMinutes,
}: {
  linkId: number;
  lastScrapedAt: string;
  maxJitterMinutes: number;
}): number {
  const input = `${linkId}:${lastScrapedAt}`;
  let hash = 0;
  for (const character of input) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  const minuteOffset = (hash % (maxJitterMinutes * 2 + 1)) - maxJitterMinutes;
  return minuteOffset * 60 * 1000;
}

export function isScanDue({
  lastScrapedAt,
  intervalMs,
  jitterMs,
  nowMs,
}: {
  lastScrapedAt: string;
  intervalMs: number;
  jitterMs: number;
  nowMs: number;
}): boolean {
  return nowMs >= Date.parse(lastScrapedAt) + intervalMs + jitterMs;
}
