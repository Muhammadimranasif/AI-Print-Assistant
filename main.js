import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let splashWindow;
let autoUpdater = null;
let updateCheckInterval = null;

// ── Load electron-updater (only works in packaged builds) ─────────────────
async function loadAutoUpdater() {
  if (!app.isPackaged) return null;
  try {
    const { autoUpdater: updater } = await import('electron-updater');
    updater.logger = null; // We handle logging ourselves via IPC
    updater.autoDownload = true;
    updater.autoInstallOnAppQuit = true;
    return updater;
  } catch (e) {
    console.warn('[Updater] electron-updater not available:', e.message);
    return null;
  }
}

// ── Send update status to renderer ────────────────────────────────────────
function sendUpdateStatus(type, payload = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', { type, ...payload });
  }
}

// ── Set up auto-updater event listeners ──────────────────────────────────
function setupAutoUpdater(updater) {
  updater.on('checking-for-update', () => {
    sendUpdateStatus('checking');
  });

  updater.on('update-available', (info) => {
    sendUpdateStatus('available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  updater.on('update-not-available', () => {
    sendUpdateStatus('not-available');
  });

  updater.on('download-progress', (progress) => {
    sendUpdateStatus('downloading', {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  updater.on('update-downloaded', (info) => {
    sendUpdateStatus('downloaded', {
      version: info.version,
      releaseNotes: info.releaseNotes,
    });
    // Stop interval — no need to keep checking
    if (updateCheckInterval) {
      clearInterval(updateCheckInterval);
      updateCheckInterval = null;
    }
  });

  updater.on('error', (err) => {
    console.error('[Updater] Error:', err.message);
    sendUpdateStatus('error', { message: err.message });
  });
}

// ── IPC handlers ──────────────────────────────────────────────────────────
function setupIPC() {
  ipcMain.handle('check-for-updates', async () => {
    if (!autoUpdater) {
      sendUpdateStatus('not-available'); // dev mode
      return;
    }
    try {
      await autoUpdater.checkForUpdates();
    } catch (e) {
      sendUpdateStatus('error', { message: e.message });
    }
  });

  ipcMain.handle('install-update', () => {
    if (autoUpdater) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  ipcMain.handle('get-version', () => app.getVersion());
}

// ── Start periodic update checks ──────────────────────────────────────────
function startUpdateInterval(updater) {
  // Check immediately on startup (after 5s delay so UI can load)
  setTimeout(async () => {
    try { await updater.checkForUpdates(); } catch (e) {
      sendUpdateStatus('error', { message: e.message });
    }
  }, 5000);

  // Then check every 60 seconds
  updateCheckInterval = setInterval(async () => {
    try { await updater.checkForUpdates(); } catch (e) {
      sendUpdateStatus('error', { message: e.message });
    }
  }, 60 * 1000);
}

// ── Splash screen ─────────────────────────────────────────────────────────
function createSplash() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 320,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    webPreferences: { nodeIntegration: false },
  });

  splashWindow.loadURL(`data:text/html,<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 480px; height: 320px;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    border-radius: 20px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: white;
    overflow: hidden;
    border: 1px solid rgba(99,102,241,0.3);
    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
    -webkit-app-region: no-drag;
  }
  .icon {
    width: 72px; height: 72px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(79,70,229,0.4);
  }
  .icon svg { width: 36px; height: 36px; color: white; }
  h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: #f1f5f9; }
  .sub { font-size: 12px; color: #94a3b8; margin-top: 6px; font-weight: 500; }
  .bar-wrap { margin-top: 32px; width: 220px; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
  .bar { height: 100%; width: 0%; background: linear-gradient(90deg, #4f46e5, #818cf8); border-radius: 2px; animation: load 1.8s ease-in-out forwards; }
  .version { margin-top: 16px; font-size: 10px; color: rgba(148,163,184,0.5); font-family: monospace; }
  @keyframes load { 0% { width: 0% } 60% { width: 75% } 100% { width: 100% } }
</style>
</head>
<body>
  <div class="icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  </div>
  <h1>AI Print Assistant</h1>
  <div class="sub">Print Shop Management System</div>
  <div class="bar-wrap"><div class="bar"></div></div>
  <div class="version">Loading system modules...</div>
</body>
</html>`);
}

// ── Main window ───────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: 'AI Print Assistant',
    autoHideMenuBar: true,
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
        splashWindow = null;
      }
      mainWindow.show();
      mainWindow.focus();
    }, 1800);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (updateCheckInterval) {
      clearInterval(updateCheckInterval);
      updateCheckInterval = null;
    }
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  setupIPC();
  createSplash();
  createWindow();

  // Load auto-updater (only in packaged builds)
  autoUpdater = await loadAutoUpdater();
  if (autoUpdater) {
    setupAutoUpdater(autoUpdater);
    startUpdateInterval(autoUpdater);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
