import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

export const EXPECTED_JOB_SWEEP_EXTENSION_ID = 'jgpidoojnckcjkpefbjhpiagfniemena';

type JobSweepManifest = {
  manifest_version?: number;
  name?: string;
  version?: string;
  key?: string;
  background?: {
    service_worker?: string;
    type?: string;
  };
};

export type JobSweepPackageMetadata = {
  extensionId: string;
  version: string;
  sourceRevision: string;
  chromeDirectory: string;
};

type ResolveJobSweepOptions = {
  explicitDirectory?: string;
  resourcesPath: string;
  appPath: string;
  homeDirectory: string;
};

function uniquePaths(paths: Array<string | undefined>) {
  const normalized = paths
    .filter((candidate): candidate is string => Boolean(candidate?.trim()))
    .map((candidate) => path.resolve(candidate));
  return [...new Set(normalized)];
}

export function getChromeExtensionId(publicKey: string) {
  const digest = createHash('sha256').update(Buffer.from(publicKey, 'base64')).digest().subarray(0, 16);
  return [...digest].map((byte) => String.fromCharCode(97 + (byte >> 4), 97 + (byte & 15))).join('');
}

export function validateJobSweepChromeDirectory(directory: string) {
  const resolvedDirectory = fs.realpathSync(directory);
  const manifestPath = path.join(resolvedDirectory, 'manifest.json');
  const managerPath = path.join(resolvedDirectory, 'runtime', 'manager', 'manager.html');
  const clientPath = path.join(resolvedDirectory, 'runtime', 'modules', 'careeros-client.js');
  const backgroundPath = path.join(resolvedDirectory, 'runtime', 'background', 'background.js');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as JobSweepManifest;

  if (manifest.manifest_version !== 3 || !manifest.name?.startsWith('Job Sweep')) {
    throw new Error('Job Sweep package must be the canonical Manifest V3 extension.');
  }
  if (!manifest.key) throw new Error('Job Sweep package is missing its stable extension identity.');
  const extensionId = getChromeExtensionId(manifest.key);
  if (extensionId !== EXPECTED_JOB_SWEEP_EXTENSION_ID) {
    throw new Error(
      `Job Sweep stable extension ID mismatch: expected ${EXPECTED_JOB_SWEEP_EXTENSION_ID}, received ${extensionId}.`,
    );
  }
  if (!manifest.version) throw new Error('Job Sweep package is missing its version.');
  if (
    manifest.background?.service_worker !== '/runtime/background/background.js' ||
    !fs.statSync(backgroundPath).isFile()
  ) {
    throw new Error('Job Sweep package is missing its canonical background runtime.');
  }

  const managerHtml = fs.readFileSync(managerPath, 'utf8');
  if (/careeros-token/i.test(managerHtml)) {
    throw new Error('Job Sweep package exposes manual bearer-token handling; local setup must use pairing.');
  }
  const clientSource = fs.readFileSync(clientPath, 'utf8');
  if (!clientSource.includes('/extension/v1/session/local')) {
    throw new Error('Job Sweep package is missing the CareerOS local pairing contract.');
  }

  return {
    directory: resolvedDirectory,
    extensionId,
    version: manifest.version,
  };
}

export function resolveCanonicalJobSweepDirectory({
  explicitDirectory,
  resourcesPath,
  appPath,
  homeDirectory,
}: ResolveJobSweepOptions) {
  const attemptedPaths = uniquePaths([
    path.join(resourcesPath, 'job-sweep', 'chrome'),
    explicitDirectory,
    path.resolve(appPath, '..', '..', '..', 'job-sweep', 'extension', 'chrome'),
    path.resolve(appPath, '..', 'job-sweep', 'extension', 'chrome'),
    path.join(homeDirectory, 'Documents', 'Playground', 'job-sweep', 'extension', 'chrome'),
  ]);
  const rejectedPaths: Array<{ directory: string; reason: string }> = [];

  for (const candidate of attemptedPaths) {
    try {
      const metadata = validateJobSweepChromeDirectory(candidate);
      return { directory: metadata.directory, metadata, attemptedPaths, rejectedPaths };
    } catch (error) {
      if (fs.existsSync(candidate)) {
        rejectedPaths.push({
          directory: candidate,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  return { directory: undefined, metadata: undefined, attemptedPaths, rejectedPaths };
}

export function stageJobSweepPackage({
  sourceDirectory,
  destinationRoot,
  sourceRevision = 'unknown',
}: {
  sourceDirectory: string;
  destinationRoot: string;
  sourceRevision?: string;
}): JobSweepPackageMetadata {
  const source = validateJobSweepChromeDirectory(sourceDirectory);
  const resolvedDestination = path.resolve(destinationRoot);
  if (resolvedDestination === source.directory || resolvedDestination.startsWith(`${source.directory}${path.sep}`)) {
    throw new Error('Job Sweep staging destination must be outside the canonical source directory.');
  }

  const chromeDirectory = path.join(resolvedDestination, 'chrome');
  fs.rmSync(chromeDirectory, { recursive: true, force: true });
  fs.mkdirSync(resolvedDestination, { recursive: true });
  fs.cpSync(source.directory, chromeDirectory, { recursive: true });
  validateJobSweepChromeDirectory(chromeDirectory);

  const metadata: JobSweepPackageMetadata = {
    extensionId: source.extensionId,
    version: source.version,
    sourceRevision,
    chromeDirectory,
  };
  fs.writeFileSync(
    path.join(resolvedDestination, 'package-metadata.json'),
    `${JSON.stringify(
      {
        schema_version: 1,
        extension_id: metadata.extensionId,
        extension_version: metadata.version,
        source_revision: metadata.sourceRevision,
      },
      null,
      2,
    )}\n`,
  );
  return metadata;
}
