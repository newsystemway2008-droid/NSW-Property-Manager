import React, { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useLocalStorage<Theme>('theme', Theme.SYSTEM);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === Theme.DARK ||
            (theme === Theme.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(isDark ? 'dark' : 'light');

        if (isDark) {
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#111827'); // dark:bg-gray-900
        } else {
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff'); // light:bg-white
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
