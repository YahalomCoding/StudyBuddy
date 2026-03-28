import { createTheme } from "@mui/material";

const appFontFamily = '"Assistant", sans-serif';

const lightThemeTokens = {
  "--sb-home-bg-start": "#fff3dc",
  "--sb-home-bg-mid": "#f6f9fc",
  "--sb-home-bg-end": "#edf6ff",
  "--sb-home-overdue-row-bg": "#fff8f6",
  "--sb-home-overdue-row-border": "#fca5a5",
  "--sb-home-overdue-text": "#b42318",
  "--sb-chip-status-done-bg": "#e8f5e9",
  "--sb-chip-status-done-text": "#2e7d32",
  "--sb-chip-status-active-bg": "#e3f2fd",
  "--sb-chip-status-active-text": "#1565c0",
  "--sb-chip-status-default-bg": "#fff3e0",
  "--sb-chip-status-default-text": "#b54708",
  "--sb-chip-type-project-bg": "#e3f2fd",
  "--sb-chip-type-project-text": "#1d4ed8",
  "--sb-chip-type-practice-bg": "#e8f5e9",
  "--sb-chip-type-practice-text": "#2e7d32",
  "--sb-chip-type-default-bg": "#f3f4f6",
  "--sb-chip-type-default-text": "#4b5563",
  "--sb-onboarding-bg-start": "#e9f3ff",
  "--sb-onboarding-bg-mid": "#f6f9fc",
  "--sb-onboarding-bg-end": "#f8f7f2",
} as const;

const darkThemeTokens = {
  "--sb-home-bg-start": "#1a1030",
  "--sb-home-bg-mid": "#111827",
  "--sb-home-bg-end": "#0d1f35",
  "--sb-home-overdue-row-bg": "#2d1212",
  "--sb-home-overdue-row-border": "#f87171",
  "--sb-home-overdue-text": "#fda29b",
  "--sb-chip-status-done-bg": "#1b3a2d",
  "--sb-chip-status-done-text": "#81c995",
  "--sb-chip-status-active-bg": "#0d2137",
  "--sb-chip-status-active-text": "#64b5f6",
  "--sb-chip-status-default-bg": "#2d1a00",
  "--sb-chip-status-default-text": "#ffb74d",
  "--sb-chip-type-project-bg": "#0d2137",
  "--sb-chip-type-project-text": "#60a5fa",
  "--sb-chip-type-practice-bg": "#1b3a2d",
  "--sb-chip-type-practice-text": "#81c995",
  "--sb-chip-type-default-bg": "#1f2937",
  "--sb-chip-type-default-text": "#9ca3af",
  "--sb-onboarding-bg-start": "#0d1f35",
  "--sb-onboarding-bg-mid": "#111827",
  "--sb-onboarding-bg-end": "#1a1a1a",
} as const;

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data",
  },
  typography: {
    fontFamily: appFontFamily,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          ...lightThemeTokens,
        },
        '[data-mui-color-scheme="dark"]': {
          ...darkThemeTokens,
        },
        html: {
          fontFamily: appFontFamily,
        },
        body: {
          fontFamily: appFontFamily,
        },
      },
    },
  },
  colorSchemes: {
    light: {
      palette: {
        // mode: "light",
        primary: {
          main: "#1976d2",
        },
        secondary: {
          main: "#9c27b0",
        },
      },
    },
    dark: {
      palette: {
        // mode: "dark",
        primary: {
          main: "#90caf9",
        },
        secondary: {
          main: "#ce93d8",
        },
      },
    },
  },
});

export default theme;
