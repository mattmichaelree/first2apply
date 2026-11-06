import { spawn } from 'child_process';
import path from 'path';

const forgeCli = require.resolve('@electron-forge/cli/dist/electron-forge.js');
const forgeArguments = process.argv.slice(2);
const packageManagerShimDirectory = path.join(__dirname, 'package-manager-shim');

if (!forgeArguments.length) {
  throw new Error('Pass an Electron Forge command such as package or make.');
}

const child = spawn(process.execPath, [forgeCli, ...forgeArguments], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    // Forge shells out to pnpm. Route that child back through Corepack so it
    // honors this workspace's pinned pnpm version and checked-in .npmrc.
    PATH: `${packageManagerShimDirectory}${path.delimiter}${process.env.PATH ?? ''}`,
  },
  shell: false,
  stdio: 'inherit',
  windowsHide: true,
});

child.once('error', (error) => {
  throw error;
});
child.once('exit', (code) => {
  process.exitCode = code ?? 1;
});
