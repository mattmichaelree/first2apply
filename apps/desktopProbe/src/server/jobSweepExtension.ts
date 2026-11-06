export const JOB_SWEEP_EXTENSION_ID = 'jgpidoojnckcjkpefbjhpiagfniemena';

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
  extensionPath: string | undefined;
  manifestExists: (extensionPath: string) => boolean;
  loadExtension: (extensionPath: string) => Promise<ExtensionInfo>;
  removeExtension: (extensionId: string) => void;
  onFailure: (error: unknown) => void;
};

/** Load only the unpacked Job Sweep bundle with the allowlisted stable ID. */
export async function loadJobSweepExtension({
  extensionPath,
  manifestExists,
  loadExtension,
  removeExtension,
  onFailure,
}: JobSweepExtensionOptions): Promise<JobSweepExtensionResult> {
  const configuredPath = extensionPath?.trim();
  if (!configuredPath) return { status: 'not_configured' };

  try {
    if (!manifestExists(configuredPath)) {
      throw new Error(`Job Sweep manifest not found at configured extension path`);
    }
    const extension = await loadExtension(configuredPath);
    if (extension.id !== JOB_SWEEP_EXTENSION_ID) {
      removeExtension(extension.id);
      throw new Error(`Configured extension did not match the allowlisted Job Sweep ID`);
    }
    return { status: 'loaded', extension };
  } catch (error) {
    onFailure(error);
    return { status: 'unavailable', error };
  }
}
