"use client"

import { useState } from "react"
import { Button, Paper, Stack, Typography } from "@mui/material"
import { useRouter } from "next/navigation"

type BootstrapResponse = {
  madeAdmin?: boolean
  error?: string
}

export function SetupClient({ email }: { email: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function onBootstrap() {
    setMessage(null)
    setLoading(true)
    try {
      // Use a relative URL so this works cleanly behind Next.js basePath="/admin".
      const res = await fetch("api/bootstrap", { method: "POST" })
      const json = (await res.json()) as BootstrapResponse
      if (!res.ok) {
        setMessage(json.error ?? "Bootstrap failed.")
        return
      }
      if (json.madeAdmin) {
        router.replace("/")
        router.refresh()
        return
      }
      setMessage(
        "An admin already exists. Ask an admin to grant access, or use a different account if this is the first setup."
      )
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Bootstrap failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          p: 3,
          borderRadius: 2,
          background:
            "linear-gradient(165deg, rgba(17,24,39,0.9), rgba(10,15,27,0.86))",
          borderColor: "rgba(142,162,255,0.3)",
          backdropFilter: "blur(10px)",
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

          {message ? (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          ) : null}

          <Button variant="contained" onClick={onBootstrap} disabled={loading}>
            {loading ? "Setting up…" : "Make me admin"}
          </Button>
        </Stack>
      </Paper>
    </div>
  )
}
