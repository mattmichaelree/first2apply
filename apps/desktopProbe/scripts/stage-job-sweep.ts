import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';

import { resolveCanonicalJobSweepDirectory, stageJobSweepPackage } from '../src/server/jobSweepPackage';

const desktopDirectory = path.resolve(__dirname, '..');
const discovery = resolveCanonicalJobSweepDirectory({
  explicitDirectory: process.env.JOB_SWEEP_CHROME_DIR,
  resourcesPath: path.join(desktopDirectory, '__no-packaged-resources__'),
  appPath: desktopDirectory,
  homeDirectory: os.homedir(),
});

if (!discovery.directory) {
  const rejected = discovery.rejectedPaths.map(({ directory, reason }) => `${directory}: ${reason}`).join('\n');
  throw new Error(
    `Canonical Job Sweep was not found. Set JOB_SWEEP_CHROME_DIR to job-sweep/extension/chrome.\nChecked:\n${discovery.attemptedPaths.join('\n')}${rejected ? `\nRejected:\n${rejected}` : ''}`,
  );
}

let sourceRevision = 'unknown';
try {
  sourceRevision = execFileSync('git', ['-C', path.resolve(discovery.directory, '..', '..'), 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
} catch {
  // A source archive without Git metadata is still valid because its manifest identity is checked.
}

const staged = stageJobSweepPackage({
  sourceDirectory: discovery.directory,
  destinationRoot: path.join(desktopDirectory, '.generated', 'job-sweep'),
  sourceRevision,
});

console.log(
  `Staged Job Sweep ${staged.version} (${staged.extensionId}) from ${discovery.directory} at ${staged.chromeDirectory}`,
);
