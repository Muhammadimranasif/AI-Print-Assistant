export type ThemeId = 'light-dashboard' | 'dark-terminal' | 'split-panel';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  previewSurface: string;
  previewText: string;
  previewHeader: string;
}

export const THEMES: Theme[] = [
  {
    id: 'light-dashboard',
    name: 'Clean Light Dashboard',
    description: 'Bright minimal surfaces. Best for daytime use and well-lit shops.',
    previewBg: '#f8fafc',
    previewAccent: '#4f46e5',
    previewSurface: '#ffffff',
    previewText: '#1e293b',
    previewHeader: '#0f172a',
  },
  {
    id: 'dark-terminal',
    name: 'Dark Terminal Pro',
    description: 'GitHub-style dark UI. Ideal for night shifts and power users.',
    previewBg: '#0d1117',
    previewAccent: '#5b34e8',
    previewSurface: '#161b22',
    previewText: '#e6edf3',
    previewHeader: '#161b22',
  },
  {
    id: 'split-panel',
    name: 'Split Panel Ops',
    description: 'Deep indigo header, two-column layout. Best for high-volume shops.',
    previewBg: '#f1f5f9',
    previewAccent: '#6366f1',
    previewSurface: '#ffffff',
    previewText: '#0f172a',
    previewHeader: '#1e1b4b',
  },
];

export const DEFAULT_THEME: ThemeId = 'light-dashboard';
