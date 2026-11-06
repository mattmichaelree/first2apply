import { getCareerOsAutostart } from '../src/env';

import fs from 'fs';
import os from 'os';
import path from 'path';

import { ensureCareerOsRuntime } from '../src/server/careerOsRuntime';
import { EXPECTED_JOB_SWEEP_EXTENSION_ID, validateJobSweepChromeDirectory } from '../src/server/jobSweepPackage';

const desktopDirectory = path.resolve(__dirname, '..');
const stagedRoot = path.join(desktopDirectory, '.generated', 'job-sweep');
const stagedChromeDirectory = path.join(stagedRoot, 'chrome');
const packageMetadataPath = path.join(stagedRoot, 'package-metadata.json');

async function main() {
  const runtime = await ensureCareerOsRuntime({
    autostart: getCareerOsAutostart(),
    explicitDirectory: process.env.CAREEROS_JOBS_DIR,
    appPath: desktopDirectory,
    homeDirectory: os.homedir(),
  });
  if (runtime.status !== 'ready') {
    throw new Error(runtime.guidance ?? 'CareerOS runtime did not become ready.');
  }

  const extension = validateJobSweepChromeDirectory(stagedChromeDirectory);
  const packageMetadata = JSON.parse(fs.readFileSync(packageMetadataPath, 'utf8')) as {
    extension_id?: string;
    extension_version?: string;
    source_revision?: string;
  };
  if (packageMetadata.extension_id !== EXPECTED_JOB_SWEEP_EXTENSION_ID) {
    throw new Error('Staged Job Sweep metadata does not match the canonical extension ID.');
  }
  if (!packageMetadata.source_revision) {
    throw new Error('Staged Job Sweep metadata does not identify its canonical source revision.');
  }

  const rejectedPairing = await fetch('http://127.0.0.1:8001/extension/v1/session/local', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Origin: 'chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
    signal: AbortSignal.timeout(3_000),
  });
  if (rejectedPairing.status !== 403) {
    throw new Error(
      `CareerOS local pairing did not fail closed for an unrecognized extension (${rejectedPairing.status}).`,
    );
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        runtime_action: runtime.action,
        api: runtime.health.api.detail,
        web: runtime.health.web.detail,
        extension_id: extension.extensionId,
        extension_version: extension.version,
        source_revision: packageMetadata.source_revision,
        invalid_pairing_status: rejectedPairing.status,
        token_copy_required: false,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
