import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
  type ChipProps,
  type PaperProps,
  type SxProps,
  type Theme,
} from "@mui/material"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import InboxRoundedIcon from "@mui/icons-material/InboxRounded"
import Link from "next/link"
import { ADMIN_HEADER_HEIGHT_VAR } from "@/lib/admin/route-meta"

// ---------------------------------------------------------------------------
// Surface tier tokens
// ---------------------------------------------------------------------------

export const ADMIN_SURFACES = {
  frame:     "rgba(10,16,30,0.92)",   // app bar, workspace headers
  primary:   "rgba(16,24,39,0.72)",   // main panels
  secondary: "rgba(16,24,39,0.50)",   // toolbars — lighter than panels
  inset:     "rgba(10,15,27,0.56)",   // table containers, card grids
  overlay:   "rgba(10,15,27,0.94)",   // drawers, modals
  panelHead: "rgba(10,16,30,0.50)",   // WorkspacePanel title bars
}

export const ADMIN_BORDERS = {
  default:   "rgba(142,162,255,0.18)", // standard panels
  strong:    "rgba(142,162,255,0.28)", // auth cards, focused
  subtle:    "rgba(142,162,255,0.10)", // table rows, detail expand
  divider:   "rgba(142,162,255,0.14)", // separators
}

export const ADMIN_BLUR = {
  frame:   "blur(12px)",  // app bar, workspace headers
  surface: "blur(8px)",   // panels
  overlay: "blur(10px)",  // drawers, auth
}

// Backward-compat aliases
const BORDER_COLOR = ADMIN_BORDERS.default
const SURFACE_BG = ADMIN_SURFACES.primary
const SURFACE_BLUR = ADMIN_BLUR.surface

// ---------------------------------------------------------------------------
// Legacy primitives (unchanged API — used by existing pages)
// ---------------------------------------------------------------------------

type AdminPageHeaderProps = {
  title: string
  description: string
  sx?: SxProps<Theme>
}

export function AdminPageHeader({ title, description, sx }: AdminPageHeaderProps) {
  return (
    <Stack spacing={1} sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: BORDER_COLOR, borderRadius: 2, background: ADMIN_SURFACES.primary, backdropFilter: ADMIN_BLUR.surface, ...sx }}>
      <Typography component="h1" variant="h4" fontWeight={760} sx={{ lineHeight: 1.2, letterSpacing: "-0.015em", fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 880, fontSize: { xs: "0.92rem", sm: "0.98rem" }, lineHeight: 1.65 }}>
        {description}
      </Typography>
    </Stack>
  )
}

type AdminPanelProps = Omit<PaperProps, "variant"> & {
  compact?: boolean
}

export function AdminPanel({ compact = false, sx, children, ...props }: AdminPanelProps) {
  return (
    <Paper variant="outlined" sx={{ p: compact ? 1.5 : 2, borderRadius: 2, borderColor: BORDER_COLOR, background: SURFACE_BG, backdropFilter: SURFACE_BLUR, ...sx }} {...props}>
      {children}
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// Collection page scaffolds
// ---------------------------------------------------------------------------

/** Page header for collection pages (Pages, Blog, Media, Bookings). */
export function CollectionPageHeader({
  title,
  description,
  actions,
  sx,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  sx?: SxProps<Theme>
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1.5, sm: 2 },
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: 760, letterSpacing: "-0.015em", lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, maxWidth: 640, lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>
      )}
    </Box>
  )
}

/** Horizontal toolbar for search, filters, and actions in collection pages. */
export function CollectionToolbar({
  children,
  sx,
}: {
  children: React.ReactNode
  sx?: SxProps<Theme>
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
        p: 1.5,
        borderRadius: 2,
        borderColor: BORDER_COLOR,
        background: ADMIN_SURFACES.secondary,
        backdropFilter: ADMIN_BLUR.surface,
        ...sx,
      }}
    >
      {children}
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// Workspace page scaffolds
// ---------------------------------------------------------------------------

/** Sticky header for workspace pages (Page editor, Section library, etc.). */
export function WorkspaceHeader({
  title,
  backHref,
  backLabel,
  status,
  actions,
  sx,
}: {
  title: string
  backHref?: string
  backLabel?: string
  status?: React.ReactNode
  actions?: React.ReactNode
  sx?: SxProps<Theme>
}) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: `var(${ADMIN_HEADER_HEIGHT_VAR}, 0px)`,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        py: 1.5,
        px: { xs: 1.5, sm: 2 },
        borderBottom: "1px solid",
        borderColor: BORDER_COLOR,
        background: "rgba(10,16,30,0.92)",
        backdropFilter: "blur(12px)",
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        {backHref && (
          <IconButton
            component={Link}
            href={backHref}
            size="small"
            aria-label={backLabel ?? "Back"}
            sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        )}
        <Typography
          component="h1"
          variant="h6"
          noWrap
          sx={{ fontWeight: 700, letterSpacing: "-0.012em" }}
        >
          {title}
        </Typography>
        {status}
      </Box>
      {actions && (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>
      )}
    </Box>
  )
}

/** Titled panel section for workspace pages. */
export function WorkspacePanel({
  title,
  description,
  actions,
  compact = false,
  children,
  sx,
}: {
  title?: string
  description?: string
  actions?: React.ReactNode
  compact?: boolean
  children: React.ReactNode
  sx?: SxProps<Theme>
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: BORDER_COLOR,
        background: SURFACE_BG,
        backdropFilter: SURFACE_BLUR,
        overflow: "hidden",
        ...sx,
      }}
    >
      {(title || actions) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: compact ? 1.5 : 2,
            py: 1,
            borderBottom: "1px solid",
            borderColor: ADMIN_BORDERS.subtle,
            background: ADMIN_SURFACES.panelHead,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography variant="subtitle2" sx={{ fontWeight: 650, fontSize: "0.875rem" }}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>{actions}</Box>
          )}
        </Box>
      )}
      <Box sx={{ p: compact ? 1.5 : 2 }}>{children}</Box>
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// Shared state components
// ---------------------------------------------------------------------------

/** Centered empty state with icon, title, description, and optional action. */
export function AdminEmptyState({
  icon,
  title,
  description,
  action,
  sx,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  sx?: SxProps<Theme>
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 6,
        px: 3,
        ...sx,
      }}
    >
      <Box sx={{ mb: 1.5, color: "text.secondary", opacity: 0.5 }}>
        {icon ?? <InboxRoundedIcon sx={{ fontSize: 40 }} />}
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 650, mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: action ? 2 : 0 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  )
}

/** Centered loading spinner with optional message. */
export function AdminLoadingState({
  message,
  sx,
}: {
  message?: string
  sx?: SxProps<Theme>
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        gap: 1.5,
        ...sx,
      }}
    >
      <CircularProgress size={24} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  )
}

/** Error alert with optional retry button. */
export function AdminErrorState({
  message,
  onRetry,
  sx,
}: {
  message: string
  onRetry?: () => void
  sx?: SxProps<Theme>
}) {
  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={{ borderRadius: 2, ...sx }}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  )
}

/** Lightweight overline heading for subsections inside workspace panels. */
export function AdminSubgroupHeader({
  label,
  description,
  sx,
}: {
  label: string
  description?: string
  sx?: SxProps<Theme>
}) {
  return (
    <Box sx={sx}>
      <Typography
        variant="overline"
        sx={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "text.secondary",
          textTransform: "uppercase",
          mt: 1,
        }}
      >
        {label}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  )
}

/** Consistent status badge for draft/published/archived states. */
export function AdminStatusBadge({
  status,
  size = "small",
  sx,
}: {
  status: string
  size?: ChipProps["size"]
  sx?: SxProps<Theme>
}) {
  const colorMap: Record<string, ChipProps["color"]> = {
    published: "success",
    draft: "warning",
    archived: "default",
    pending: "info",
    approved: "success",
    rejected: "error",
  }

  return (
    <Chip
      label={status}
      size={size}
      color={colorMap[status.toLowerCase()] ?? "default"}
      variant="outlined"
      sx={{ textTransform: "capitalize", ...sx }}
    />
  )
}

// ---------------------------------------------------------------------------
// Page workspace identity
// ---------------------------------------------------------------------------

/** Mode tabs shared between Page Editor and Visual Editor. */
export function PageWorkspaceModeTabs({
  pageId,
  activeMode,
}: {
  pageId: string
  activeMode: "form" | "visual"
}) {
  const modes = [
    { key: "form" as const, label: "Form", href: `/admin/pages/${pageId}` },
    { key: "visual" as const, label: "Visual", href: `/admin/pages/${pageId}/visual` },
  ]

  return (
    <Box
      sx={{
        display: "inline-flex",
        gap: "2px",
        p: "2px",
        borderRadius: 1,
        bgcolor: "rgba(142,162,255,0.08)",
        border: "1px solid rgba(142,162,255,0.12)",
      }}
    >
      {modes.map((m) => (
        <Button
          key={m.key}
          component={Link}
          href={m.href}
          size="small"
          variant={m.key === activeMode ? "contained" : "text"}
          sx={{
            fontSize: "0.6875rem",
            fontWeight: m.key === activeMode ? 650 : 500,
            py: 0.25,
            px: 1.25,
            minWidth: 0,
            minHeight: 0,
            lineHeight: 1.4,
            borderRadius: 0.75,
            ...(m.key !== activeMode && {
              color: "text.secondary",
              "&:hover": { color: "text.primary", bgcolor: "rgba(142,162,255,0.12)" },
            }),
          }}
        >
          {m.label}
        </Button>
      ))}
    </Box>
  )
}
