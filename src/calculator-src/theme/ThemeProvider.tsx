"use client";

import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ReactNode, createContext, useState, useMemo, useContext, useEffect } from 'react';

type ThemeContextType = {
  toggleTheme: () => void;
  mode: 'light' | 'dark';
};

export const ThemeContext = createContext<ThemeContextType>({
  toggleTheme: () => {},
  mode: 'dark',
});

export const useThemeContext = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#d97732',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'dark' ? '#110f0f' : '#f9fafb',
            paper: mode === 'dark' ? '#1c1917' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#111827',
            secondary: mode === 'dark' ? '#a8a29e' : '#4b5563',
          },
          divider: mode === 'dark' ? '#332f2c' : '#e5e7eb',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 24,
                padding: '12px 24px',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: 'none',
                border: `1px solid ${theme.palette.divider}`,
              }),
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 12,
                backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : '#f9fafb',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.text.secondary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }),
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}
