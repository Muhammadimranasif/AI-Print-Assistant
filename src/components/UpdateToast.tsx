/**
 * UpdateToast.tsx
 * Visible auto-update UI — shows progress bar, errors, and install button.
 * Place <UpdateToast /> anywhere in App.tsx (e.g. near the bottom of the JSX).
 *
 * Works via window.electronAPI (injected by preload.cjs).
 * In dev mode (no Electron), the component stays hidden.
 */
import { useEffect, useState } from 'react';

type UpdateState =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'available'; version: string; releaseNotes?: string }
  | { type: 'downloading'; percent: number; bytesPerSecond: number }
  | { type: 'downloaded'; version: string }
  | { type: 'not-available' }
  | { type: 'error'; message: string };

// Expose the electron API type
declare global {
  interface Window {
    electronAPI?: {
      onUpdateStatus: (cb: (data: UpdateState) => void) => void;
      checkForUpdates: () => void;
      installUpdate: () => void;
      removeUpdateListeners: () => void;
      getVersion: () => Promise<string>;
    };
  }
}

export function UpdateToast() {
  const [state, setState] = useState<UpdateState>({ type: 'idle' });
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');

  const api = window.electronAPI;

  useEffect(() => {
    if (!api) return; // dev mode — do nothing

    // Get current app version
    api.getVersion().then(setAppVersion).catch(() => {});

    // Listen for update status events from main process
    api.onUpdateStatus((data) => {
      setState(data);

      // Show toast for actionable states; hide for idle/not-available
      if (
        data.type === 'available' ||
        data.type === 'downloading' ||
        data.type === 'downloaded' ||
        data.type === 'error'
      ) {
        setVisible(true);
        setDismissed(false);
      } else if (data.type === 'not-available') {
        // Briefly show "up to date" then hide
        setVisible(true);
        setTimeout(() => setVisible(false), 3000);
      }
    });

    return () => {
      api.removeUpdateListeners?.();
    };
  }, []);

  // Hide if dismissed or not visible
  if (!api || !visible || dismissed) return null;

  const formatBytes = (bps: number) => {
    if (bps > 1_000_000) return `${(bps / 1_000_000).toFixed(1)} MB/s`;
    if (bps > 1_000) return `${(bps / 1_000).toFixed(0)} KB/s`;
    return `${bps} B/s`;
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-80 rounded-xl shadow-2xl border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderColor: 'rgba(99,102,241,0.4)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-900/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔄</span>
          <span className="text-sm font-bold text-white">AI Print Assistant</span>
          {appVersion && (
            <span className="text-xs text-indigo-400 font-mono">v{appVersion}</span>
          )}
        </div>
        {state.type !== 'downloading' && (
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-slate-300 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {/* ── Checking ── */}
        {state.type === 'checking' && (
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
            Checking for updates...
          </div>
        )}

        {/* ── Update available ── */}
        {state.type === 'available' && (
          <div className="space-y-1">
            <p className="text-green-400 font-semibold text-sm">
              ✅ Update available — v{state.version}
            </p>
            <p className="text-slate-400 text-xs">Downloading automatically...</p>
          </div>
        )}

        {/* ── Downloading ── */}
        {state.type === 'downloading' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>⬇️ Downloading update...</span>
              <span>{formatBytes(state.bytesPerSecond)}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${state.percent}%`,
                  background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
                }}
              />
            </div>
            <div className="text-right text-xs text-indigo-400 font-mono">
              {state.percent}%
            </div>
          </div>
        )}

        {/* ── Downloaded / ready to install ── */}
        {state.type === 'downloaded' && (
          <div className="space-y-3">
            <p className="text-green-400 font-semibold text-sm">
              ✅ v{state.version} ready to install
            </p>
            <p className="text-slate-400 text-xs">
              Restart the app to apply the update.
            </p>
            <button
              onClick={() => window.electronAPI?.installUpdate()}
              className="w-full py-2 px-4 rounded-lg text-sm font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              }}
            >
              🚀 Restart & Install Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="w-full py-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Install on next restart
            </button>
          </div>
        )}

        {/* ── Up to date ── */}
        {state.type === 'not-available' && (
          <p className="text-slate-300 text-sm">✅ You're on the latest version!</p>
        )}

        {/* ── Error ── */}
        {state.type === 'error' && (
          <div className="space-y-2">
            <p className="text-red-400 font-semibold text-sm">❌ Update failed</p>
            <p className="text-slate-400 text-xs break-words">{state.message}</p>
            <button
              onClick={() => {
                window.electronAPI?.checkForUpdates();
                setState({ type: 'checking' });
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Standalone "Check for Updates" button ─────────────────────────────────
// Drop this anywhere in your Settings UI
export function CheckForUpdatesButton() {
  const [checking, setChecking] = useState(false);
  const api = window.electronAPI;

  if (!api) return null;

  const handleCheck = () => {
    setChecking(true);
    api.checkForUpdates();
    setTimeout(() => setChecking(false), 3000);
  };

  return (
    <button
      onClick={handleCheck}
      disabled={checking}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
        checking
          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400'
      }`}
    >
      <span>{checking ? '⏳' : '🔄'}</span>
      {checking ? 'Checking...' : 'Check for Updates'}
    </button>
  );
}
