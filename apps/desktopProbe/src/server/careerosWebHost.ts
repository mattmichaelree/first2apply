type CareerOsWebHostOptions = {
  webUrl: string | undefined;
  bundledRendererUrl: string;
  loadUrl: (url: string) => Promise<void>;
  onFailure: (error: unknown) => void;
};

export function isCareerOsWebNavigation(url: string, webUrl: string | undefined) {
  if (!webUrl) return false;

  try {
    return new URL(url).origin === new URL(webUrl).origin;
  } catch {
    return false;
  }
}

export function shouldExposeDesktopBridge(pageUrl: string, bundledRendererUrl: string | undefined) {
  if (!bundledRendererUrl) return false;
  try {
    const page = new URL(pageUrl);
    const bundled = new URL(bundledRendererUrl);
    if (bundled.protocol === 'file:') return page.href === bundled.href;
    return page.origin === bundled.origin;
  } catch {
    return false;
  }
}

export function loadCareerOsWebHost({
  webUrl,
  bundledRendererUrl,
  loadUrl,
  onFailure,
}: CareerOsWebHostOptions): Promise<void> {
  if (!webUrl) return loadUrl(bundledRendererUrl);

  return loadUrl(webUrl).catch((error: unknown) => {
    onFailure(error);
    return loadUrl(bundledRendererUrl);
  });
}
