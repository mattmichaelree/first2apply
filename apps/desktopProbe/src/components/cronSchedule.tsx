import { AVAILABLE_CRON_RULES } from '@/lib/types';
import { JobSite, SiteProvider } from '@careeros/core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@careeros/ui';

const DEFAULT_SCHEDULE_VALUE = '__default__';
const PAUSED_SCHEDULE_VALUE = '__paused__';

/**
 * Component used to set the cron schedule of the probe.
 */
export function CronSchedule({
  cronRule,
  onCronRuleChange,
}: {
  cronRule?: string;
  onCronRuleChange: (cron: string | undefined) => void;
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-6 rounded-lg border p-6">
      <div className="space-y-1">
        <h2 className="text-lg">Search Frequency</h2>
        <p className="text-sm font-light">How often do you want to receive job notifications?</p>
      </div>
      <Select value={cronRule} onValueChange={onCronRuleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Never" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_CRON_RULES.map((rule) => (
            <SelectItem key={rule.value} value={rule.value}>
              {rule.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BoardSchedules({
  sites,
  siteCronRules,
  onSiteCronRuleChange,
}: {
  sites: JobSite[];
  siteCronRules: Partial<Record<SiteProvider, string | null>>;
  onSiteCronRuleChange: (provider: SiteProvider, cronRule: string | null | undefined) => void;
}) {
  return (
    <section className="space-y-4 rounded-lg border p-6" aria-labelledby="board-schedules-title">
      <div className="space-y-1">
        <h2 id="board-schedules-title" className="text-lg">
          Job board schedules
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Slow down bot-sensitive boards without delaying safer sources. Unchanged boards use the default frequency.
        </p>
      </div>

      <div className="divide-y">
        {sites.map((site) => {
          const override = siteCronRules[site.provider];
          const value = override === undefined ? DEFAULT_SCHEDULE_VALUE : (override ?? PAUSED_SCHEDULE_VALUE);
          const isLinkedIn = site.provider === SiteProvider.linkedin;

          return (
            <div
              key={site.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <label className="text-sm font-medium" htmlFor={`schedule-${site.provider}`}>
                  {site.name}
                </label>
                <p className="text-sm text-muted-foreground">
                  {isLinkedIn
                    ? 'Adds up to 20 minutes of timing variation around its four-hour target.'
                    : 'Uses its own cadence when overridden.'}
                </p>
              </div>
              <Select
                value={value}
                onValueChange={(selectedValue) => {
                  if (selectedValue === DEFAULT_SCHEDULE_VALUE) onSiteCronRuleChange(site.provider, undefined);
                  else if (selectedValue === PAUSED_SCHEDULE_VALUE) onSiteCronRuleChange(site.provider, null);
                  else onSiteCronRuleChange(site.provider, selectedValue);
                }}
              >
                <SelectTrigger id={`schedule-${site.provider}`} className="w-full sm:w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEFAULT_SCHEDULE_VALUE}>Use default</SelectItem>
                  {AVAILABLE_CRON_RULES.map((rule) => (
                    <SelectItem key={rule.value} value={rule.value}>
                      {rule.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={PAUSED_SCHEDULE_VALUE}>Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </section>
  );
}
