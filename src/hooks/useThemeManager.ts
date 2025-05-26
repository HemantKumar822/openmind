import { useState, useEffect, useCallback } from 'react';
import { storageUtils, ThemePreference } from '@/lib/storage';

/**
 * Manages the application's theme, including persistence and system theme synchronization.
 * It handles theme state, applies themes to the DOM, and provides a toggle function.
 *
 * @returns {object} An object containing the current theme, the resolved theme (light/dark),
 * a function to set the theme, and a function to toggle the theme.
 */
export const useThemeManager = () => {
  /** @type {[ThemePreference, React.Dispatch<React.SetStateAction<ThemePreference>>]} */
  const [theme, setThemeState] = useState<ThemePreference>(storageUtils.getTheme());
  /** @type {['light' | 'dark', React.Dispatch<React.SetStateAction<'light' | 'dark'>>]} */
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(storageUtils.getResolvedTheme());

  /**
   * Applies the given resolved theme ('light' or 'dark') to the document's root element.
   * This involves adding/removing the 'dark' class and setting 'data-theme' and 'color-scheme'.
   * @param {'light' | 'dark'} currentResolvedTheme - The theme to apply.
   */
  const applyThemeToDOM = (currentResolvedTheme: 'light' | 'dark') => {
    if (currentResolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  /**
   * Sets the application theme.
   * This updates the theme state, persists it to storage, resolves the actual theme (light/dark),
   * and applies it to the DOM.
   * @param {ThemePreference} newTheme - The new theme preference ('light', 'dark', or 'system').
   */
  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    storageUtils.setTheme(newTheme);
    
    const newResolvedTheme = newTheme === 'system' ? storageUtils.getSystemTheme() : newTheme;
    setResolvedTheme(newResolvedTheme);
    applyThemeToDOM(newResolvedTheme);
  }, []);

  useEffect(() => {
    // Initial theme application
    applyThemeToDOM(resolvedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (storageUtils.getTheme() === 'system') { // Check storage directly in case state hasn't updated
        const newSystemTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newSystemTheme);
        applyThemeToDOM(newSystemTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [resolvedTheme]); // Depend on resolvedTheme to re-apply if it changes externally, though system changes are main trigger

  /**
   * Toggles the theme through the sequence: light -> dark -> system -> light.
   */
  const handleThemeToggle = useCallback(() => {
    const newTheme = 
      theme === 'light' ? 'dark' :
      theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return { 
    /** @type {ThemePreference} The currently selected theme preference (light, dark, or system). */
    theme, 
    /** @type {'light' | 'dark'} The resolved theme currently applied (light or dark). */
    resolvedTheme, 
    /** @type {(newTheme: ThemePreference) => void} Function to set a new theme preference. */
    setTheme, 
    /** @type {() => void} Function to toggle the theme. */
    handleThemeToggle 
  };
};
