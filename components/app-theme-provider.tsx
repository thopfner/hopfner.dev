"use client"

import { CssBaseline } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useMemo } from "react"

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: { main: "#8ea2ff" },
          secondary: { main: "#4be2d5" },
          background: {
            default: "#090d16",
            paper: "#111a2b",
          },
          text: {
            primary: "#e6ebff",
            secondary: "#9ea8cf",
          },
          divider: "rgba(142,162,255,0.18)",
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily:
            "var(--font-inter), var(--font-geist-sans), Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          h4: { fontWeight: 760, letterSpacing: "-0.018em", lineHeight: 1.15 },
          h5: { fontWeight: 760, letterSpacing: "-0.015em" },
          h6: { fontWeight: 700, letterSpacing: "-0.012em" },
          subtitle1: { fontWeight: 650, letterSpacing: "-0.01em" },
          subtitle2: { fontWeight: 600 },
          body2: { fontSize: "0.875rem", lineHeight: 1.6 },
          caption: { fontSize: "0.75rem", letterSpacing: "0.01em" },
          overline: { fontSize: "0.6875rem", fontWeight: 650, letterSpacing: "0.06em", textTransform: "uppercase" },
          button: { textTransform: "none", fontWeight: 620 },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: "0 10px 36px rgba(2,8,26,0.45)",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                boxShadow: "inset -1px 0 0 rgba(142,162,255,0.14)",
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                transition: "all 160ms ease",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                borderColor: "rgba(142,162,255,0.18)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: "rgba(142,162,255,0.10)",
                padding: "8px 12px",
                fontSize: "0.8125rem",
              },
              head: {
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase" as const,
                letterSpacing: "0.04em",
                color: "#9ea8cf",
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "&:last-child td": { borderBottom: 0 },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "0.75rem",
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: "none" as const,
                fontWeight: 600,
                fontSize: "0.8125rem",
                minHeight: 40,
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              root: {
                minHeight: 40,
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                fontSize: "0.8125rem",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 14,
                border: "1px solid rgba(142,162,255,0.18)",
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: "0.75rem",
                fontWeight: 500,
                borderRadius: 6,
                backgroundColor: "rgba(17,26,43,0.95)",
                border: "1px solid rgba(142,162,255,0.15)",
              },
            },
          },
        },
      }),
    []
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
