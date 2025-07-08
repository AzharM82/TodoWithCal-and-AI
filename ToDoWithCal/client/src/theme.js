import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // Apple blue
    },
    secondary: {
      main: '#FF9500', // Apple orange accent
    },
    background: {
      default: '#F8F9FB',
      paper: '#FFFFFF',
    },
    success: {
      main: '#34C759',
    },
    error: {
      main: '#FF3B30',
    },
    warning: {
      main: '#FFCC00',
    },
    info: {
      main: '#5AC8FA',
    },
    text: {
      primary: '#1C1C1E',
      secondary: '#636366',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 700,
      letterSpacing: 0.1,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: 0.2,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
});

export default theme;
