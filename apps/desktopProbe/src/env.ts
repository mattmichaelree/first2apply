export function getCareerOsWebUrl(value = process.env.CAREEROS_WEB_URL) {
  const url = value?.trim();
  if (!url) return undefined;

  try {
    const parsedUrl = new URL(url);
    const loopbackHosts = new Set(['127.0.0.1', 'localhost', '[::1]']);
    return (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && loopbackHosts.has(parsedUrl.hostname)
      ? parsedUrl.href
      : undefined;
  } catch {
    return undefined;
  }
}

export const DEFAULT_CAREEROS_WEB_URL = 'http://127.0.0.1:5174/';

export const ENV = {
  nodeEnv: process.env.NODE_ENV,
  appBundleId: process.env.APP_BUNDLE_ID,
  careerOsWebUrl: getCareerOsWebUrl(process.env.CAREEROS_WEB_URL ?? DEFAULT_CAREEROS_WEB_URL),
  jobSweepExtensionPath: process.env.CAREEROS_JOB_SWEEP_EXTENSION_PATH?.trim() || undefined,
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  mezmoApiKey: process.env.MEZMO_API_KEY,
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  updateFeedUrl: process.env.UPDATE_FEED_URL,
};
