import { createTheme } from '@mui/material/styles';

export const DESIGN_TOKENS = {
  bgMain: '#090B10',
  bgSecondary: '#10141C',
  bgCard: '#151B25',
  bgElevated: '#1C2430',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  textPrimary: '#F5F7FA',
  textSecondary: '#A0A9B7',
  textMuted: '#687386',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export function createIplTheme(accentColor = '#3B82F6') {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: accentColor,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#F59E0B',
      },
      success: {
        main: DESIGN_TOKENS.success,
      },
      warning: {
        main: DESIGN_TOKENS.warning,
      },
      error: {
        main: DESIGN_TOKENS.error,
      },
      info: {
        main: DESIGN_TOKENS.info,
      },
      background: {
        default: DESIGN_TOKENS.bgMain,
        paper: DESIGN_TOKENS.bgCard,
      },
      text: {
        primary: DESIGN_TOKENS.textPrimary,
        secondary: DESIGN_TOKENS.textSecondary,
      },
      divider: DESIGN_TOKENS.border,
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.025em' },
      h2: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: DESIGN_TOKENS.bgMain,
            color: DESIGN_TOKENS.textPrimary,
            fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
            scrollbarColor: '#293244 #090B10',
          },
          '.tabular-nums': {
            fontVariantNumeric: 'tabular-nums',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: DESIGN_TOKENS.bgCard,
            backgroundImage: 'none',
            border: `1px solid ${DESIGN_TOKENS.border}`,
            borderRadius: 14,
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderColor: DESIGN_TOKENS.border,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingLeft: 16,
            paddingRight: 16,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: DESIGN_TOKENS.bgSecondary,
            border: `1px solid ${DESIGN_TOKENS.borderStrong}`,
            borderRadius: 16,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: DESIGN_TOKENS.bgSecondary,
            borderColor: DESIGN_TOKENS.border,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${DESIGN_TOKENS.border}`,
          },
          head: {
            color: DESIGN_TOKENS.textSecondary,
            fontWeight: 600,
            backgroundColor: DESIGN_TOKENS.bgSecondary,
          },
        },
      },
    },
  });
}
