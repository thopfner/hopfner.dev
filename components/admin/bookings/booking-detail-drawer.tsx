"use client"

import {
  Box,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"

import {
  ADMIN_SURFACES,
  ADMIN_BORDERS,
  ADMIN_BLUR,
} from "@/components/admin/ui"
import { ADMIN_HEADER_HEIGHT } from "@/lib/admin/route-meta"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookingIntake = {
  id: string
  full_name: string
  work_email: string
  company: string | null
  job_title: string | null
  team_size: string | null
  function_area: string | null
  current_tools: string | null
  main_bottleneck: string | null
  desired_outcome_90d: string | null
  status: string
  cal_booking_uid: string | null
  created_at: string
  updated_at: string
}

const STATUS_COLORS: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
  submitted: "warning",
  booked: "success",
  rescheduled: "info",
  cancelled: "error",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function Field({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  if (!value) return null
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, fontSize: "0.6875rem", letterSpacing: "0.02em" }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 0.25,
          lineHeight: 1.55,
          ...(mono && { fontFamily: "monospace", fontSize: "0.8rem" }),
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "text.secondary",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  )
}

function SectionDivider() {
  return (
    <Box
      sx={{
        height: "1px",
        bgcolor: ADMIN_BORDERS.divider,
        mx: -2.5,
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

const DRAWER_TITLE_ID = "booking-detail-drawer-title"

export function BookingDetailDrawer({
  intake,
  open,
  onClose,
}: {
  intake: BookingIntake | null
  open: boolean
  onClose: () => void
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: false,
        "aria-labelledby": DRAWER_TITLE_ID,
      }}
      PaperProps={{
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": DRAWER_TITLE_ID,
        sx: {
          width: { xs: "100%", sm: 460, lg: 540 },
          top: ADMIN_HEADER_HEIGHT,
          height: `calc(100% - ${ADMIN_HEADER_HEIGHT}px)`,
          borderLeft: "1px solid",
          borderColor: ADMIN_BORDERS.default,
          background: ADMIN_SURFACES.overlay,
          backdropFilter: ADMIN_BLUR.overlay,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {intake && (
        <>
          {/* ── Sticky header ── */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              px: 2.5,
              py: 2,
              borderBottom: "1px solid",
              borderColor: ADMIN_BORDERS.subtle,
              background: ADMIN_SURFACES.frame,
              backdropFilter: ADMIN_BLUR.frame,
              shrink: 0,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  id={DRAWER_TITLE_ID}
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, fontSize: "0.6875rem", letterSpacing: "0.04em", textTransform: "uppercase" }}
                >
                  Booking Details
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, mt: 0.25 }}>
                  {intake.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {intake.work_email}
                </Typography>
                {intake.company && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                    {intake.company}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, mt: 0.5 }}>
                <Chip
                  label={intake.status}
                  size="small"
                  color={STATUS_COLORS[intake.status] || "default"}
                  variant="outlined"
                  sx={{ textTransform: "capitalize" }}
                />
                <IconButton
                  aria-label="Close booking details"
                  onClick={onClose}
                  size="small"
                  sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* ── Scrollable body ── */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
            <Stack spacing={2.5}>
              {/* Summary strip */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "rgba(142,162,255,0.04)",
                  border: `1px solid ${ADMIN_BORDERS.subtle}`,
                }}
              >
                <Field label="Submitted" value={formatDateLong(intake.created_at)} />
                <Field label="Last updated" value={formatDateLong(intake.updated_at)} />
                {intake.company && <Field label="Company" value={intake.company} />}
                {intake.cal_booking_uid && <Field label="Cal UID" value={intake.cal_booking_uid} mono />}
              </Box>

              <SectionDivider />

              {/* Profile */}
              <Stack spacing={1.5}>
                <SectionHeading>Profile</SectionHeading>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  <Field label="Full name" value={intake.full_name} />
                  <Field label="Work email" value={intake.work_email} />
                  <Field label="Company" value={intake.company} />
                  <Field label="Job title" value={intake.job_title} />
                  <Field label="Team size" value={intake.team_size} />
                  <Field label="Function area" value={intake.function_area} />
                </Box>
              </Stack>

              <SectionDivider />

              {/* Operational context */}
              {(intake.current_tools || intake.main_bottleneck) && (
                <>
                  <Stack spacing={1.5}>
                    <SectionHeading>Operational context</SectionHeading>
                    <Field label="Current tools" value={intake.current_tools} />
                    <Field label="Main bottleneck" value={intake.main_bottleneck} />
                  </Stack>
                  <SectionDivider />
                </>
              )}

              {/* Goals */}
              {intake.desired_outcome_90d && (
                <>
                  <Stack spacing={1.5}>
                    <SectionHeading>Goals</SectionHeading>
                    <Field label="Desired outcome (90d)" value={intake.desired_outcome_90d} />
                  </Stack>
                  <SectionDivider />
                </>
              )}

              {/* System metadata */}
              <Stack spacing={1.5} sx={{ opacity: 0.7 }}>
                <SectionHeading>System</SectionHeading>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  <Field label="Status" value={intake.status} />
                  <Field label="Created" value={formatDateLong(intake.created_at)} />
                  <Field label="Updated" value={formatDateLong(intake.updated_at)} />
                  {intake.cal_booking_uid && <Field label="Cal booking UID" value={intake.cal_booking_uid} mono />}
                </Box>
              </Stack>
            </Stack>
          </Box>
        </>
      )}
    </Drawer>
  )
}
