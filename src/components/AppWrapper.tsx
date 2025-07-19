import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { createAppTheme } from '../theme/theme';

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const theme = createAppTheme(isDarkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppWrapper; 