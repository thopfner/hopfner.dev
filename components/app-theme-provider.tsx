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
          divider: "rgba(142,162,255,0.22)",
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily:
            "var(--font-inter), var(--font-geist-sans), Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          h5: { fontWeight: 760, letterSpacing: "-0.015em" },
          h6: { fontWeight: 700, letterSpacing: "-0.012em" },
          button: { textTransform: "none", fontWeight: 620 },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: "0 10px 30px rgba(2,8,26,0.35)",
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
                borderColor: "rgba(140,157,255,0.18)",
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
