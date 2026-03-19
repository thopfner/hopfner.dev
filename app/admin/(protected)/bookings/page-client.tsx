"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"

import {
  AdminPanel,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  CollectionPageHeader,
  CollectionToolbar,
} from "@/components/admin/ui"
import { BookingDetailDrawer, type BookingIntake } from "@/components/admin/bookings/booking-detail-drawer"

type Intake = BookingIntake

const STATUS_COLORS: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
  submitted: "warning",
  booked: "success",
  rescheduled: "info",
  cancelled: "error",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function BookingsPageClient() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [intakes, setIntakes] = useState<Intake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedIntake = intakes.find((i) => i.id === selectedId) ?? null

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/admin/api/bookings")
      const d = await res.json()
      setIntakes(d.intakes ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Stack spacing={2}>
      <CollectionPageHeader
        title="Bookings"
        description="Intake submissions from the booking flow. Click a row to view details."
      />

      {error && <AdminErrorState message={error} onRetry={load} />}

      <CollectionToolbar>
        <Chip size="small" variant="outlined" label={`${intakes.length} submission${intakes.length !== 1 ? "s" : ""}`} />
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshRoundedIcon fontSize="small" />}
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </Button>
      </CollectionToolbar>

      <AdminPanel sx={{ p: 0 }}>
        {loading ? (
          <AdminLoadingState message="Loading submissions…" />
        ) : intakes.length === 0 ? (
          <AdminEmptyState title="No submissions yet" description="Intake submissions will appear here when users complete the booking form." />
        ) : isMobile ? (
          /* ── Mobile cards ── */
          <Stack spacing={1.25} sx={{ p: 1.25 }}>
            {intakes.map((row) => (
              <Paper
                key={row.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  ...(selectedId === row.id && {
                    borderColor: "rgba(142,162,255,0.35)",
                    bgcolor: "rgba(142,162,255,0.06)",
                  }),
                }}
                onClick={() => setSelectedId(row.id)}
              >
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>{row.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.work_email}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                      <Chip
                        label={row.status}
                        size="small"
                        color={STATUS_COLORS[row.status] || "default"}
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                      <ChevronRightRoundedIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.5 }} />
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {row.company && <Typography variant="caption" color="text.secondary">{row.company}</Typography>}
                    <Typography variant="caption" color="text.secondary">{formatDate(row.created_at)}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          /* ── Desktop table ── */
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell sx={{ width: 32 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {intakes.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      cursor: "pointer",
                      transition: "background 0.15s",
                      ...(selectedId === row.id && {
                        bgcolor: "rgba(142,162,255,0.06)",
                      }),
                    }}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{row.full_name}</Typography>
                    </TableCell>
                    <TableCell>{row.work_email}</TableCell>
                    <TableCell>{row.company || "\u2014"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={STATUS_COLORS[row.status] || "default"}
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(row.created_at)}
                    </TableCell>
                    <TableCell sx={{ pr: 1.5 }}>
                      <ChevronRightRoundedIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.4 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminPanel>

      <BookingDetailDrawer
        intake={selectedIntake}
        open={selectedId !== null && selectedIntake !== null}
        onClose={() => setSelectedId(null)}
      />
    </Stack>
  )
}
