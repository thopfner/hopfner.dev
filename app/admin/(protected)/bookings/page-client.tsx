"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"

type Intake = {
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function BookingsPageClient() {
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch("/admin/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        setIntakes(d.intakes ?? [])
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography color="error" sx={{ py: 4 }}>
        Failed to load bookings: {error}
      </Typography>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Booking Intakes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {intakes.length} submission{intakes.length !== 1 ? "s" : ""}
      </Typography>

      {intakes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No intake submissions yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: "rgba(17,24,39,0.6)" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {intakes.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ cursor: "pointer", "& td": { borderBottom: expanded === row.id ? "none" : undefined } }}
                    onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                  >
                    <TableCell>{row.full_name}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{row.work_email}</TableCell>
                    <TableCell>{row.company || "\u2014"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={STATUS_COLORS[row.status] || "default"}
                        variant="outlined"
                        sx={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {formatDate(row.created_at)}
                    </TableCell>
                  </TableRow>
                  {expanded === row.id && (
                    <TableRow key={`${row.id}-detail`}>
                      <TableCell colSpan={5} sx={{ pt: 0, pb: 2, px: 3 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 1.5,
                            mt: 0.5,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <Detail label="Job title" value={row.job_title} />
                          <Detail label="Team size" value={row.team_size} />
                          <Detail label="Function area" value={row.function_area} />
                          <Detail label="Current tools" value={row.current_tools} />
                          <Detail label="Main bottleneck" value={row.main_bottleneck} />
                          <Detail label="Desired outcome (90d)" value={row.desired_outcome_90d} />
                          {row.cal_booking_uid && (
                            <Detail label="Cal booking UID" value={row.cal_booking_uid} />
                          )}
                          <Detail label="Last updated" value={formatDate(row.updated_at)} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  )
}
