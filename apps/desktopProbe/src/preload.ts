// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

import { shouldExposeDesktopBridge } from './server/careerosWebHost';

const theme = process.argv.find((argument) => argument.startsWith('--careeros-theme='))?.split('=', 2)[1];
const bundledUrlArgument = process.argv.find((argument) => argument.startsWith('--careeros-bundled-url='))?.split('=', 2)[1];
const bundledUrl = bundledUrlArgument ? decodeURIComponent(bundledUrlArgument) : undefined;

if (shouldExposeDesktopBridge(window.location.href, bundledUrl)) {
  contextBridge.exposeInMainWorld('electron', {
    invoke: ipcRenderer.invoke,
    on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => {
      return ipcRenderer.on(channel, callback);
    },
    theme,
  });
}
