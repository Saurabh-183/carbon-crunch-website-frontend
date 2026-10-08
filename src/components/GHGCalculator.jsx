import React from 'react';
import { Box } from '@mui/material';
import ThemeProvider from '@/theme/ThemeProvider';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import DashboardPage from '@/app/(dashboard)/page';

export default function GHGCalculator() {
  return (
    <ThemeProvider>
      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100%', transition: 'background-color 0.3s ease' }} className="relative w-full pb-12">
        <ThemeToggleButton />
        <DashboardPage />
      </Box>
    </ThemeProvider>
  );
}
