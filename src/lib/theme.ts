import { createTheme, ThemeOptions } from '@mui/material/styles';
import { arEG, enUS } from '@mui/material/locale';

declare module '@mui/material/styles' {
  interface Palette {
    neutral?: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Roboto", "Inter", "Cairo", "Tajawal", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#1976d2',
        },
        thumb: {
          width: 20,
          height: 20,
        },
        track: {
          height: 4,
        },
        rail: {
          height: 4,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ffb74d',
      light: '#ffe0b2',
      dark: '#ff9800',
      contrastText: '#000000',
    },
    success: {
      main: '#81c784',
      light: '#c8e6c9',
      dark: '#4caf50',
    },
    error: {
      main: '#e57373',
      light: '#ffcdd2',
      dark: '#f44336',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffe0b2',
      dark: '#ff9800',
    },
    info: {
      main: '#64b5f6',
      light: '#bbdefb',
      dark: '#2196f3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
  },
});

export const arabicTheme = createTheme(lightTheme, arEG);
export const arabicDarkTheme = createTheme(darkTheme, arEG);
export const englishTheme = createTheme(lightTheme, enUS);
export const englishDarkTheme = createTheme(darkTheme, enUS);

export const getTheme = (mode: 'light' | 'dark', language: 'ar' | 'en') => {
  if (language === 'ar') {
    return mode === 'dark' ? arabicDarkTheme : arabicTheme;
  }
  return mode === 'dark' ? englishDarkTheme : englishTheme;
};
