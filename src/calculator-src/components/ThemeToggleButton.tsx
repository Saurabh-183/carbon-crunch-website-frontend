"use client";

import { IconButton } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useThemeContext } from '@/theme/ThemeProvider';

export default function ThemeToggleButton() {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        boxShadow: 2,
        '&:hover': {
          backgroundColor: 'background.default',
        }
      }}
    >
      {mode === 'dark' ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
}
