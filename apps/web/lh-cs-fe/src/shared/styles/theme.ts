import { createTheme } from '@mui/material/styles';

export const DeviceWidth = {
  '4k': 1921,
  desktop: 1280,
  laptop: 1279,
  tablet: 1024,
  fold: 767,
  mobileLg: 673,
  mobile: 427,
  mobileSm: 359,
};

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0055a2',
      light: '#3574b8',
      dark: '#003c71',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6d7f83',
      light: '#9ca5a8',
      dark: '#4a585b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1d',
      secondary: '#6d7f83',
    },
    grey: {
      300: '#dee2e6',
      500: '#999999',
      600: '#666666',
      700: '#6d7f83',
      900: '#1d1d1d',
    },
  },
  typography: {
    fontFamily: [
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Pretendard',
      fontWeight: 700,
      fontSize: '30px',
      lineHeight: 'normal',
      letterSpacing: '-1.5px',
    },
    h6: {
      fontFamily: 'Pretendard',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: 1.3,
    },
    body1: {
      fontFamily: 'Pretendard',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '20px',
    },
    button: {
      fontFamily: 'Pretendard',
      fontWeight: 500,
      fontSize: '20px',
      letterSpacing: '0.46px',
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          height: '48px',
          fontSize: '20px',
          fontWeight: 500,
          letterSpacing: '0.46px',
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: 500,
            '& fieldset': {
              borderColor: '#dee2e6',
            },
            '&:hover fieldset': {
              borderColor: '#0055a2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0055a2',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '14px',
            fontWeight: 500,
            color: '#1d1d1d',
            transform: 'translate(14px, -9px) scale(0.75)',
            '&.Mui-focused': {
              color: '#0055a2',
            },
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#999999',
          '&:hover': {
            color: '#6d7f83',
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
});
