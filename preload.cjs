/**
 * preload.cjs — IPC bridge between Electron main process and React renderer.
 * Must be .cjs because package.json has "type": "module".
 * Exposes window.electronAPI safely to the renderer.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Auto-updater ──────────────────────────────────────────────────────────
  /** Listen for update status events from main process */
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (_event, data) => callback(data));
  },

  /** Manually trigger an update check (e.g. from Settings button) */
  checkForUpdates: () => {
    ipcRenderer.invoke('check-for-updates');
  },

  /** Install downloaded update and restart */
  installUpdate: () => {
    ipcRenderer.invoke('install-update');
  },

  /** Clean up listeners when component unmounts */
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-status');
  },

  // ── App info ──────────────────────────────────────────────────────────────
  getVersion: () => ipcRenderer.invoke('get-version'),
});
