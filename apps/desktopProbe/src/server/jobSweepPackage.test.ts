import { afterEach, describe, expect, it } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  EXPECTED_JOB_SWEEP_EXTENSION_ID,
  getChromeExtensionId,
  resolveCanonicalJobSweepDirectory,
  stageJobSweepPackage,
  validateJobSweepChromeDirectory,
} from './jobSweepPackage';

const JOB_SWEEP_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2+q4H7lq3kLnMX4fHFWVGR7L0BG4+c62DS1K5nKmZ3FkKyCA6GQ7Rz92ljbl1IacXyZo43TnvRbKKbZiX5lSYk0+Gy+15epNJN8FLYRZyTzK9yzqATWr+ovicNS73lMAmYlk6n3pP88pi3xMTayLfWohd7B922dIQYNzW0/sGFejZBrVR6E8KJu2GNtlam5sbnqfJTdLoIIP5zodmz/TlJWxZqZO/B8cMBVhnceVmPf5YQtymTLnHiy56JaJ8okZSs7zYfjculmdpwJWpHYSMQE5QAf/YEalQk/SpYlSg2vSJsadWupDN5pGrbh7J9zHY3ZwS3u6kV3eimIZy0iSZwIDAQAB';

const temporaryDirectories: string[] = [];

function createTemporaryDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'job-sweep-package-test-'));
  temporaryDirectories.push(directory);
  return directory;
}

function createJobSweepFixture(
  directory: string,
  overrides: { key?: string; managerHtml?: string; clientSource?: string } = {},
) {
  fs.mkdirSync(path.join(directory, 'runtime', 'manager'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'runtime', 'modules'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'runtime', 'background'), { recursive: true });
  fs.writeFileSync(
    path.join(directory, 'manifest.json'),
    JSON.stringify({
      manifest_version: 3,
      name: "Job Sweep: Filter Jobs You Don't Want",
      version: '8.3.0',
      key: overrides.key ?? JOB_SWEEP_PUBLIC_KEY,
      background: { service_worker: '/runtime/background/background.js', type: 'module' },
    }),
  );
  fs.writeFileSync(
    path.join(directory, 'runtime', 'manager', 'manager.html'),
    overrides.managerHtml ?? '<button id="connect-careeros">Connect</button>',
  );
  fs.writeFileSync(
    path.join(directory, 'runtime', 'modules', 'careeros-client.js'),
    overrides.clientSource ?? 'fetch(`${apiOrigin}/extension/v1/session/local`, { method: "POST" });',
  );
  fs.writeFileSync(path.join(directory, 'runtime', 'background', 'background.js'), '// fixture');
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('canonical Job Sweep identity', () => {
  it('derives the stable Chrome extension ID from the manifest public key', () => {
    expect(getChromeExtensionId(JOB_SWEEP_PUBLIC_KEY)).toBe('jgpidoojnckcjkpefbjhpiagfniemena');
    expect(EXPECTED_JOB_SWEEP_EXTENSION_ID).toBe('jgpidoojnckcjkpefbjhpiagfniemena');
  });

  it('rejects a package with a different extension identity', () => {
    const source = path.join(createTemporaryDirectory(), 'chrome');
    createJobSweepFixture(source, { key: Buffer.from('not-the-canonical-key').toString('base64') });

    expect(() => validateJobSweepChromeDirectory(source)).toThrow('stable extension ID');
  });

  it('rejects a package that restores a manual CareerOS token field', () => {
    const source = path.join(createTemporaryDirectory(), 'chrome');
    createJobSweepFixture(source, {
      managerHtml: '<input name="careeros-token" type="password"><button>Connect</button>',
    });

    expect(() => validateJobSweepChromeDirectory(source)).toThrow('manual bearer-token');
  });

  it('rejects a package without the fail-closed local pairing endpoint', () => {
    const source = path.join(createTemporaryDirectory(), 'chrome');
    createJobSweepFixture(source, { clientSource: 'export const connect = () => undefined;' });

    expect(() => validateJobSweepChromeDirectory(source)).toThrow('local pairing');
  });
});

describe('Job Sweep package staging', () => {
  it('copies the validated extension and records its canonical identity', () => {
    const source = path.join(createTemporaryDirectory(), 'canonical', 'extension', 'chrome');
    const destination = path.join(createTemporaryDirectory(), 'job-sweep');
    createJobSweepFixture(source);

    const result = stageJobSweepPackage({
      sourceDirectory: source,
      destinationRoot: destination,
      sourceRevision: 'abc1234',
    });

    expect(result).toMatchObject({
      extensionId: 'jgpidoojnckcjkpefbjhpiagfniemena',
      version: '8.3.0',
      sourceRevision: 'abc1234',
      chromeDirectory: path.join(destination, 'chrome'),
    });
    expect(JSON.parse(fs.readFileSync(path.join(destination, 'package-metadata.json'), 'utf8'))).toMatchObject({
      extension_id: 'jgpidoojnckcjkpefbjhpiagfniemena',
      source_revision: 'abc1234',
    });
    expect(fs.existsSync(path.join(destination, 'chrome', 'runtime', 'manager', 'manager.html'))).toBe(true);
  });

  it('prefers an installed packaged copy over development checkout candidates', () => {
    const resourcesPath = createTemporaryDirectory();
    const packaged = path.join(resourcesPath, 'job-sweep', 'chrome');
    createJobSweepFixture(packaged);

    expect(
      resolveCanonicalJobSweepDirectory({
        resourcesPath,
        appPath: createTemporaryDirectory(),
        homeDirectory: createTemporaryDirectory(),
      }).directory,
    ).toBe(fs.realpathSync(packaged));
  });
});
