import { config as loadEnvVars } from 'dotenv';

import { MakerAppX } from '@electron-forge/maker-appx';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerFlatpak } from '@electron-forge/maker-flatpak';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import type { ForgeConfig } from '@electron-forge/shared-types';
import path from 'path';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

// load env vars
loadEnvVars({ path: path.join(__dirname, '..', 'desktopProbe', '.env') });

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: [path.join(__dirname, '.generated', 'job-sweep')],
    icon: path.join(__dirname, 'packagers', 'icons', 'paper-plane'),
    appBundleId: process.env.APP_BUNDLE_ID,
    protocols: [
      {
        name: 'CareerOS',
        schemes: ['careeros'],
      },
    ],
    osxSign: {},
    osxNotarize: {
      appleId: process.env.APPLE_ID ?? '',
      appleIdPassword: process.env.APPLE_PASSWORD ?? '',
      teamId: process.env.APPLE_TEAM_ID ?? '',
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      authors: 'CareerOS',
      name: 'careeros',
      setupIcon: path.join(__dirname, 'packagers', 'icons', 'paper-plane.ico'),
    }),
    new MakerDMG({
      format: 'ULFO',
      background: path.join(__dirname, 'packagers', 'macos-dmg-background.png'),
      additionalDMGOptions: {
        window: {
          size: {
            width: 658,
            height: 498,
          },
        },
      },
    }),
    new MakerAppX({
      packageName: 'CareerOS.Desktop',
      publisher: process.env.WINDOWS_PUBLISHER ?? 'CN=CareerOS',
      makeVersionWinStoreCompatible: true,
      // @ts-expect-error - Property doesn't exist on type definition but is valid
      publisherDisplayName: 'CareerOS',
      assets: './packagers/appx/icons',
      manifest: './packagers/appx/AppXManifest.xml',
      // Use development certificate
      devCert: path.join(__dirname, 'packagers', 'appx', 'devcert.pfx'),
      certPass: process.env.WINDOWS_CERT_PASSWORD ?? '',
    }),
    new MakerDeb({
      options: {
        name: 'CareerOS',
        bin: 'CareerOS',
        icon: path.join(__dirname, 'packagers', 'icons', 'paper-plane.png'),
        mimeType: ['x-scheme-handler/careeros'],
      },
    }),
    new MakerRpm({
      options: {
        name: 'CareerOS',
        bin: 'CareerOS',
        icon: path.join(__dirname, 'packagers', 'icons', 'paper-plane.png'),
        mimeType: ['x-scheme-handler/careeros'],
      },
    }),
    new MakerFlatpak({
      options: {
        id: process.env.APP_BUNDLE_ID,
        productName: 'CareerOS',
        genericName: 'Job Search',
        icon: path.join(__dirname, 'packagers', 'icons', 'paper-plane.png'),
        categories: ['Utility'],
        mimeType: ['x-scheme-handler/careeros'],
        files: [],
      },
    }),
    {
      name: '@electron-forge/maker-zip',
      config: {},
    },
  ],
  publishers: [],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      devContentSecurityPolicy: `default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;`,
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
      port: 3049,
    }),
  ],
};

export default config;
