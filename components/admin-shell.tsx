"use client"

import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState, type ElementType } from "react"
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded"
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded"
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import FolderRoundedIcon from "@mui/icons-material/FolderRounded"
import FeedRoundedIcon from "@mui/icons-material/FeedRounded"

import { createClient } from "@/lib/supabase/browser"

const HEADER_HEIGHT = 52
const DESKTOP_DRAWER_OPEN = 176
const DESKTOP_DRAWER_CLOSED = 72
const MOBILE_DRAWER_WIDTH = 216

type NavItem = {
  href: string
  label: string
  aria: string
  icon: ElementType
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Pages", aria: "Pages", icon: ArticleRoundedIcon },
  { href: "/section-library", label: "Library", aria: "Section library", icon: AutoStoriesRoundedIcon },
  { href: "/global-sections", label: "Global", aria: "Global sections", icon: FolderRoundedIcon },
  { href: "/blog", label: "Blog", aria: "Blog", icon: FeedRoundedIcon },
  { href: "/media", label: "Media", aria: "Media", icon: CollectionsRoundedIcon },
]

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/pages")
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          background: {
            default: "#0f1115",
            paper: "#11141b",
          },
        },
        shape: {
          borderRadius: 10,
        },
        typography: {
          fontFamily:
            "var(--font-inter), var(--font-geist-sans), Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          button: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      }),
    []
  )

  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"))

  const [desktopNavOpen, setDesktopNavOpen] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navOpen = isDesktop ? desktopNavOpen : mobileNavOpen
  const desktopDrawerWidth = desktopNavOpen ? DESKTOP_DRAWER_OPEN : DESKTOP_DRAWER_CLOSED

  const currentTitle = useMemo(() => {
    const current = NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href))
    return current?.label ?? "Admin"
  }, [pathname])

  async function onSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  function toggleNav() {
    if (isDesktop) {
      setDesktopNavOpen((v) => !v)
      return
    }
    setMobileNavOpen((v) => !v)
  }

  function renderNav(showLabels: boolean) {
    return (
      <Box sx={{ display: "flex", height: "100%", flexDirection: "column", p: 1 }}>
        <List dense sx={{ py: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.href)
            const Icon = item.icon

            const node = (
              <ListItemButton
                selected={active}
                onClick={() => {
                  router.push(item.href)
                  if (!isDesktop) setMobileNavOpen(false)
                }}
                aria-label={item.aria}
                sx={{
                  minHeight: 38,
                  px: showLabels ? 1.1 : 0.75,
                  py: 0.5,
                  borderRadius: 1.25,
                  justifyContent: showLabels ? "flex-start" : "center",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: showLabels ? 32 : "auto",
                    mr: showLabels ? 1 : 0,
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>
                {showLabels ? (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                  />
                ) : null}
              </ListItemButton>
            )

            if (showLabels) return <Box key={item.href}>{node}</Box>

            return (
              <Tooltip key={item.href} title={item.label} placement="right">
                <Box>{node}</Box>
              </Tooltip>
            )
          })}
        </List>

        <Box sx={{ mt: "auto", pt: 1 }}>
          <Divider sx={{ mb: 1 }} />
          {showLabels ? (
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<LogoutRoundedIcon fontSize="small" />}
              onClick={onSignOut}
              aria-label="Sign out"
            >
              Sign out
            </Button>
          ) : (
            <Tooltip title="Sign out" placement="right">
              <IconButton
                onClick={onSignOut}
                aria-label="Sign out"
                size="small"
                sx={{
                  width: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <LogoutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh", width: "100%" }}>
        <AppBar
          position="fixed"
          color="transparent"
          elevation={0}
          sx={{
            height: HEADER_HEIGHT,
            justifyContent: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(17,20,27,0.88)",
            backdropFilter: "blur(10px)",
            zIndex: (muiTheme) => muiTheme.zIndex.drawer + 2,
          }}
        >
          <Box
            sx={{
              height: "100%",
              px: { xs: 1, sm: 1.5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <IconButton
                size="small"
                color="inherit"
                onClick={toggleNav}
                aria-label={navOpen ? "Collapse navigation" : "Expand navigation"}
              >
                <MenuRoundedIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                hopfner.dev CMS
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "inline" }, whiteSpace: "nowrap" }}
              >
                {currentTitle}
              </Typography>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: { xs: "none", sm: "block" }, maxWidth: 300 }}
            >
              {email}
            </Typography>
          </Box>
        </AppBar>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            width: desktopDrawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: desktopDrawerWidth,
              top: HEADER_HEIGHT,
              height: `calc(100% - ${HEADER_HEIGHT}px)`,
              boxSizing: "border-box",
              overflowX: "hidden",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
        >
          {renderNav(desktopNavOpen)}
        </Drawer>

        <Drawer
          variant="temporary"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: MOBILE_DRAWER_WIDTH,
              top: HEADER_HEIGHT,
              height: `calc(100% - ${HEADER_HEIGHT}px)`,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
        >
          {renderNav(true)}
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            mt: `${HEADER_HEIGHT}px`,
            ml: { xs: 0, sm: `${desktopDrawerWidth}px` },
            p: { xs: 1, sm: 2 },
          }}
        >
          <div className="admin-content">{children}</div>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
