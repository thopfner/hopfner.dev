"use client"

import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState, type ElementType } from "react"
import {
  AppBar,
  Box,
  Button,
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
import useMediaQuery from "@mui/material/useMediaQuery"
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded"
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded"
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import FolderRoundedIcon from "@mui/icons-material/FolderRounded"
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded"
import EmailRoundedIcon from "@mui/icons-material/EmailRounded"
import FeedRoundedIcon from "@mui/icons-material/FeedRounded"

import { createClient } from "@/lib/supabase/browser"
import {
  resolveAdminRouteMeta,
  ADMIN_HEADER_HEIGHT,
  ADMIN_HEADER_HEIGHT_VAR,
} from "@/lib/admin/route-meta"

const DESKTOP_DRAWER_OPEN = 196
const DESKTOP_DRAWER_CLOSED = 74
const MOBILE_DRAWER_WIDTH = 240

const DRAWER_TRANSITION = "width 200ms cubic-bezier(0.4, 0, 0.2, 1)"

type NavItem = {
  href: string
  label: string
  aria: string
  icon: ElementType
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Pages", aria: "Pages", icon: ArticleRoundedIcon },
      { href: "/admin/blog", label: "Blog", aria: "Blog", icon: FeedRoundedIcon },
      { href: "/admin/media", label: "Media", aria: "Media", icon: CollectionsRoundedIcon },
      { href: "/admin/bookings", label: "Bookings", aria: "Bookings", icon: CalendarMonthRoundedIcon },
    ],
  },
  {
    label: "Configure",
    items: [
      { href: "/admin/section-library", label: "Library", aria: "Section library", icon: AutoStoriesRoundedIcon },
      { href: "/admin/global-sections", label: "Global", aria: "Global sections", icon: FolderRoundedIcon },
      { href: "/admin/email-templates", label: "Emails", aria: "Email templates", icon: EmailRoundedIcon },
    ],
  },
]

function isNavItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/pages")
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

// ---------------------------------------------------------------------------
// Route-class-driven content area styles
// ---------------------------------------------------------------------------

const CONTENT_STYLES = {
  collection: {
    p: { xs: 1.5, sm: 2.25 },
  },
  workspace: {
    p: { xs: 1.5, sm: 2 },
    background: "rgba(9,13,22,0.42)",
    boxShadow: "inset 0 1px 0 rgba(142,162,255,0.10)",
  },
  immersive: {
    p: { xs: 1.5, sm: 2.25 },
    background: "transparent",
  },
} as const

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const isDesktop = useMediaQuery("(min-width:600px)")

  const [desktopNavOpen, setDesktopNavOpen] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navOpen = isDesktop ? desktopNavOpen : mobileNavOpen
  const desktopDrawerWidth = desktopNavOpen ? DESKTOP_DRAWER_OPEN : DESKTOP_DRAWER_CLOSED

  const routeMeta = useMemo(() => resolveAdminRouteMeta(pathname), [pathname])

  async function onSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/admin/login")
    router.refresh()
  }

  function toggleNav() {
    if (isDesktop) {
      setDesktopNavOpen((v) => !v)
      return
    }
    setMobileNavOpen((v) => !v)
  }

  function renderNavItem(item: NavItem, showLabels: boolean) {
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
          minHeight: 40,
          px: showLabels ? 1.25 : 0.75,
          py: 0.5,
          borderRadius: 1.5,
          justifyContent: showLabels ? "flex-start" : "center",
          border: "1px solid",
          borderColor: active ? "rgba(124,140,255,0.55)" : "transparent",
          background: active ? "linear-gradient(135deg, rgba(142,162,255,0.30), rgba(75,226,213,0.18))" : "transparent",
          "&:hover": { backgroundColor: active ? "rgba(142,162,255,0.33)" : "rgba(148,163,184,0.16)" },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: showLabels ? 30 : "auto",
            mr: showLabels ? 0.75 : 0,
            justifyContent: "center",
            color: "inherit",
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </ListItemIcon>
        {showLabels ? (
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 650 : 500 }}
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
  }

  function renderNav(showLabels: boolean) {
    return (
      <Box sx={{ display: "flex", height: "100%", flexDirection: "column", p: 1 }}>
        {NAV_GROUPS.map((group, groupIdx) => (
          <Box key={group.label} sx={{ mb: groupIdx < NAV_GROUPS.length - 1 ? 1 : 0 }}>
            {showLabels ? (
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  px: 1.25,
                  pt: groupIdx === 0 ? 0.75 : 1,
                  pb: 0.75,
                  fontSize: "0.6875rem",
                  fontWeight: 650,
                  letterSpacing: "0.08em",
                  color: "text.secondary",
                  opacity: 0.72,
                  lineHeight: 1,
                }}
              >
                {group.label}
              </Typography>
            ) : (
              groupIdx > 0 && (
                <Divider sx={{ my: 0.75, borderColor: "rgba(142,162,255,0.12)" }} />
              )
            )}
            <List dense sx={{ py: 0, display: "flex", flexDirection: "column", gap: 0.25 }}>
              {group.items.map((item) => renderNavItem(item, showLabels))}
            </List>
          </Box>
        ))}

        <Box sx={{ mt: "auto", pt: 1 }}>
          <Divider sx={{ mb: 1, borderColor: "rgba(142,162,255,0.12)" }} />
          {showLabels ? (
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<LogoutRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={onSignOut}
              aria-label="Sign out"
              sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 0.5 }}
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
                <LogoutRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    )
  }

  const contentSx = CONTENT_STYLES[routeMeta.routeClass]

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        width: "100%",
        background: "radial-gradient(1200px 600px at 10% -10%, rgba(124,140,255,0.22), transparent 45%), radial-gradient(900px 480px at 90% -10%, rgba(75,226,213,0.18), transparent 45%), #090d16",
        [ADMIN_HEADER_HEIGHT_VAR]: `${ADMIN_HEADER_HEIGHT}px`,
      }}
    >
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          height: ADMIN_HEADER_HEIGHT,
          justifyContent: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(10,16,30,0.88)",
          backdropFilter: "blur(12px)",
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
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
          >
            <IconButton
              size="small"
              color="inherit"
              onClick={toggleNav}
              aria-label={navOpen ? "Collapse navigation" : "Expand navigation"}
            >
              <MenuRoundedIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="subtitle2"
              sx={{
                whiteSpace: "nowrap",
                fontWeight: 700,
                fontSize: "0.8125rem",
                letterSpacing: "0.01em",
                color: "text.secondary",
                display: { xs: "none", sm: "inline" },
              }}
            >
              hopfner.dev
            </Typography>
            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                width: "1px",
                height: 16,
                bgcolor: "divider",
                flexShrink: 0,
              }}
            />
            {routeMeta.parentLabel && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                    color: "text.secondary",
                    display: { xs: "none", sm: "inline" },
                  }}
                >
                  {routeMeta.parentLabel}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    opacity: 0.4,
                    display: { xs: "none", sm: "inline" },
                  }}
                >
                  /
                </Typography>
              </>
            )}
            <Typography
              variant="subtitle2"
              sx={{
                whiteSpace: "nowrap",
                fontWeight: 700,
                fontSize: "0.9375rem",
                letterSpacing: "-0.01em",
                color: "#e9eeff",
              }}
            >
              {routeMeta.title}
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
          transition: DRAWER_TRANSITION,
          "& .MuiDrawer-paper": {
            width: desktopDrawerWidth,
            transition: DRAWER_TRANSITION,
            top: ADMIN_HEADER_HEIGHT,
            height: `calc(100% - ${ADMIN_HEADER_HEIGHT}px)`,
            boxSizing: "border-box",
            overflowX: "hidden",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(17,24,39,0.92)",
            backdropFilter: "blur(8px)",
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
            top: ADMIN_HEADER_HEIGHT,
            height: `calc(100% - ${ADMIN_HEADER_HEIGHT}px)`,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(17,24,39,0.92)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        {renderNav(true)}
      </Drawer>

      <Box
        component="main"
        data-route-class={routeMeta.routeClass}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          mt: `${ADMIN_HEADER_HEIGHT}px`,
          ml: 0,
          ...contentSx,
        }}
      >
        <div className="admin-content">{children}</div>
      </Box>
    </Box>
  )
}
