import { Paper, Stack, Typography, type PaperProps, type SxProps, type Theme } from "@mui/material"

type AdminPageHeaderProps = {
  title: string
  description: string
  sx?: SxProps<Theme>
}

export function AdminPageHeader({ title, description, sx }: AdminPageHeaderProps) {
  return (
    <Stack spacing={1} sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "rgba(142,162,255,0.22)", borderRadius: 2, background: "linear-gradient(140deg, rgba(16,24,39,0.78), rgba(10,15,27,0.68))", backdropFilter: "blur(6px)", ...sx }}>
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
    <Paper variant="outlined" sx={{ p: compact ? 1.5 : 2, borderRadius: 2, borderColor: "rgba(142,162,255,0.22)", background: "rgba(16,24,39,0.72)", backdropFilter: "blur(6px)", ...sx }} {...props}>
      {children}
    </Paper>
  )
}
