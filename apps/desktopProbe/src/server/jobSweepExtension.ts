import path from 'path';

export const JOB_SWEEP_EXTENSION_ID = 'jgpidoojnckcjkpefbjhpiagfniemena';
export const JOB_SWEEP_PACKAGED_DIRECTORY = 'job-sweep-chrome';

type ExtensionInfo = {
  id: string;
  name: string;
  version: string;
};

type JobSweepExtensionResult =
  | { status: 'not_configured' }
  | { status: 'loaded'; extension: ExtensionInfo }
  | { status: 'unavailable'; error: unknown };

type JobSweepExtensionOptions = {
  extensionPaths: readonly (string | undefined)[];
  manifestExists: (extensionPath: string) => boolean;
  getLoadedExtensions?: () => readonly ExtensionInfo[];
  loadExtension: (extensionPath: string) => Promise<ExtensionInfo>;
  removeExtension: (extensionId: string) => void;
  onFailure: (error: unknown) => void;
};

type JobSweepExtensionPathsOptions = {
  configuredPath: string | undefined;
  resourcesPath: string;
  appPath: string;
};

type JobSweepPackageResourcesOptions = {
  desktopRoot: string;
  manifestExists: (manifestPath: string) => boolean;
};

function getJobSweepRepositoryPath(desktopRoot: string) {
  return path.resolve(desktopRoot, '..', '..', '..', 'job-sweep');
}

export function getJobSweepExtensionPaths({ configuredPath, resourcesPath, appPath }: JobSweepExtensionPathsOptions) {
  return [
    configuredPath?.trim() || undefined,
    path.join(resourcesPath, JOB_SWEEP_PACKAGED_DIRECTORY),
    path.join(getJobSweepRepositoryPath(appPath), 'dist', 'bundles', 'chrome'),
  ];
}

export function getJobSweepPackageResources({ desktopRoot, manifestExists }: JobSweepPackageResourcesOptions) {
  const bundlePath = path.join(getJobSweepRepositoryPath(desktopRoot), 'dist', JOB_SWEEP_PACKAGED_DIRECTORY);
  return manifestExists(path.join(bundlePath, 'manifest.json')) ? [bundlePath] : [];
}

/** Load only the unpacked Job Sweep bundle with the allowlisted stable ID. */
export async function loadJobSweepExtension({
  extensionPaths,
  manifestExists,
  getLoadedExtensions,
  loadExtension,
  removeExtension,
  onFailure,
}: JobSweepExtensionOptions): Promise<JobSweepExtensionResult> {
  const candidatePaths = extensionPaths
    .map((extensionPath) => extensionPath?.trim())
    .filter((extensionPath): extensionPath is string => Boolean(extensionPath));
  if (candidatePaths.length === 0) return { status: 'not_configured' };

  try {
    const extensionPath = candidatePaths.find(manifestExists);
    if (!extensionPath) {
      throw new Error(`Job Sweep manifest not found at any supported extension path`);
    }
    const installedExtension = getLoadedExtensions?.().find((extension) => extension.id === JOB_SWEEP_EXTENSION_ID);
    if (installedExtension) {
      removeExtension(installedExtension.id);
    }
    const extension = await loadExtension(extensionPath);
    if (extension.id !== JOB_SWEEP_EXTENSION_ID) {
      removeExtension(extension.id);
      throw new Error(`Selected extension did not match the allowlisted Job Sweep ID`);
    }
    return { status: 'loaded', extension };
  } catch (error) {
    onFailure(error);
    return { status: 'unavailable', error };
  }
}
