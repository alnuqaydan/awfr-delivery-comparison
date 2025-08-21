'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getTheme } from '@/lib/theme';
import { useEffect } from 'react';

interface ThemeRegistryProps {
  children: React.ReactNode;
}

export function ThemeRegistry({ children }: ThemeRegistryProps) {
  const { language, theme } = useAppSelector((state) => state.settings);
  
  // Determine actual theme mode (system preference)
  const getActualTheme = () => {
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const actualTheme = getActualTheme();
  const muiTheme = getTheme(actualTheme, language);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Set theme class
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    
    // Set RTL direction for Arabic
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', language);
    
    // Set font family
    root.style.setProperty('--font-family', language === 'ar' ? 'var(--font-cairo)' : 'var(--font-inter)');
  }, [actualTheme, language]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const root = document.documentElement;
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
