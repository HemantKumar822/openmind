import { useState, useEffect, useCallback } from 'react';
import { ThemePreference } from '@/lib/storage';
import { storageUtils } from '@/lib/storage';

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = storageUtils.getTheme();
    setThemeState(storedTheme);
    setResolvedTheme(storageUtils.getResolvedTheme());
    setIsMounted(true);
  }, []);

  // Handle system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Apply theme to DOM
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    setResolvedTheme(theme);
  }, []);

  // Set new theme
  const setTheme = useCallback((newTheme: ThemePreference) => {
    storageUtils.setTheme(newTheme);
    setThemeState(newTheme);
    
    if (newTheme === 'system') {
      applyTheme(storageUtils.getSystemTheme());
    } else {
      applyTheme(newTheme);
    }
  }, [applyTheme]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isMounted,
  };
};
