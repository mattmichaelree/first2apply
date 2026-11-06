import { JobSite, SiteProvider, throwError } from '@careeros/core';

export function getJobSite({
  allJobSites,
  url,
  hasCustomJobsParsing,
}: {
  allJobSites: JobSite[];
  url: string;
  hasCustomJobsParsing: boolean;
}): JobSite {
  const getUrlDomain = (value: string) => {
    const hostname = new URL(value).hostname.replace('emplois.', '');
    const parts = hostname.split('.').reverse();
    while (parts.length > 3) parts.shift();
    const [, domain] = parts;
    return domain;
  };

  const urlDomain = getUrlDomain(url);
  let site = allJobSites.find((candidate) =>
    candidate.urls.some((siteUrl) => getUrlDomain(siteUrl) === urlDomain),
  );

  const parsedUrl = new URL(url);
  site?.blacklisted_paths.forEach((path) => {
    const pathname = parsedUrl.pathname.toLowerCase();
    const blacklistedPath = path.toLowerCase();
    if (pathname === blacklistedPath || pathname + '/' === blacklistedPath) {
      throw new Error(
        `Looks like the URL you are trying to save does not contain any search params. Make sure to configure your desired filters like role/tech stach, location, etc. on ${parsedUrl.hostname} and try again. Optionally add the last 24h filter when possible.`,
      );
    }
  });

  if (!site && hasCustomJobsParsing) {
    site = allJobSites.find((candidate) => candidate.provider === SiteProvider.custom) ?? throwError('No custom site found');
  } else if (!site) {
    throw new Error(
      `Scanning for jobs on ${parsedUrl.hostname} is only available on the PRO plan. Please contact support if you think this is a mistake.`,
    );
  }

  return site;
}

export function cleanJobUrl({
  allJobSites,
  url,
  hasCustomJobsParsing,
}: {
  allJobSites: JobSite[];
  url: string;
  hasCustomJobsParsing: boolean;
}) {
  const site = getJobSite({ allJobSites, url, hasCustomJobsParsing });
  let cleanUrl = url;

  if (site.queryParamsToRemove) {
    const parsedUrl = new URL(url);
    site.queryParamsToRemove.forEach((param) => parsedUrl.searchParams.delete(param));
    cleanUrl = parsedUrl.toString();
  }

  if (site.provider === SiteProvider.linkedin) {
    const parsedUrl = new URL(cleanUrl);
    parsedUrl.searchParams.set('sortBy', 'DD');
    cleanUrl = parsedUrl.toString();
  }

  return { cleanUrl, site };
}
