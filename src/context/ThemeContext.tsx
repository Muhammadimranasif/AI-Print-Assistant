import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, DEFAULT_THEME } from '../themes';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('aipa_theme');
    return (saved as ThemeId) || DEFAULT_THEME;
  });

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    localStorage.setItem('aipa_theme', id);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
