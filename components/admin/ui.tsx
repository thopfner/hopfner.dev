import { Paper, Stack, Typography, type PaperProps, type SxProps, type Theme } from "@mui/material"

type AdminPageHeaderProps = {
  title: string
  description: string
  sx?: SxProps<Theme>
}

export function AdminPageHeader({ title, description, sx }: AdminPageHeaderProps) {
  return (
    <Stack spacing={0.5} sx={sx}>
      <Typography variant="h5" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
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
    <Paper variant="outlined" sx={{ p: compact ? 1.5 : 2, ...sx }} {...props}>
      {children}
    </Paper>
  )
}
