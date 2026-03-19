"use client"

import { useState } from "react"
import { Alert, Button, Paper, Stack, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { ADMIN_BORDERS, ADMIN_BLUR } from "@/components/admin/ui"

type BootstrapResponse = {
  madeAdmin?: boolean
  error?: string
}

type Notice = { kind: "error" | "info"; message: string }

export function SetupClient({ email }: { email: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  async function onBootstrap() {
    setNotice(null)
    setLoading(true)
    try {
      const res = await fetch("api/bootstrap", { method: "POST" })
      const json = (await res.json()) as BootstrapResponse
      if (!res.ok) {
        setNotice({ kind: "error", message: json.error ?? "Bootstrap failed." })
        return
      }
      if (json.madeAdmin) {
        router.replace("/admin")
        router.refresh()
        return
      }
      setNotice({
        kind: "info",
        message: "An admin already exists. Ask an admin to grant access, or use a different account if this is the first setup.",
      })
    } catch (e) {
      setNotice({ kind: "error", message: e instanceof Error ? e.message : "Bootstrap failed." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 py-10">
      <Typography
        variant="overline"
        sx={{
          mb: 2,
          fontWeight: 650,
          letterSpacing: "0.08em",
          color: "text.secondary",
          opacity: 0.6,
        }}
      >
        hopfner.dev CMS
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          p: 3,
          borderRadius: 2,
          background:
            "linear-gradient(165deg, rgba(17,24,39,0.9), rgba(10,15,27,0.86))",
          borderColor: ADMIN_BORDERS.strong,
          backdropFilter: ADMIN_BLUR.overlay,
          boxShadow: "0 22px 56px rgba(2,6,23,0.5)",
        }}
      >
        <Stack spacing={2}>
          <div>
            <Typography variant="h5" color="primary.light" fontWeight={700}>
              One-time Setup
            </Typography>
            <Typography color="text.secondary" variant="body2" lineHeight={1.55}>
              Signed in as {email}. If no admin exists yet, you can bootstrap
              yourself as the first admin.
            </Typography>
          </div>

          {notice && (
            <Alert severity={notice.kind} variant="outlined">
              {notice.message}
            </Alert>
          )}

          <Button variant="contained" onClick={onBootstrap} disabled={loading}>
            {loading ? "Setting up…" : "Make me admin"}
          </Button>
        </Stack>
      </Paper>
    </div>
  )
}
