"use client"

import { useMemo, useState } from "react"
import {
  Alert,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { createClient } from "@/lib/supabase/browser"
import { ADMIN_BORDERS, ADMIN_BLUR } from "@/components/admin/ui"

type Notice = { kind: "error" | "info" | "success"; message: string }

export function LoginForm() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  async function onSubmit() {
    setNotice(null)
    setLoading(true)
    try {
      const trimmedEmail = email.trim()
      if (!trimmedEmail) {
        setNotice({ kind: "error", message: "Email is required." })
        return
      }

      if (password.trim()) {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        if (error) {
          setNotice({ kind: "error", message: error.message })
          return
        }
        router.replace("/admin")
        router.refresh()
        return
      }

      const redirectTo = `${window.location.origin}/admin/auth/callback`
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) {
        setNotice({ kind: "error", message: error.message })
        return
      }

      setNotice({
        kind: "success",
        message:
          "Magic link sent. Check your email and open the link to finish signing in.",
      })
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
              Sign in
            </Typography>
            <Typography color="text.secondary" variant="body2" lineHeight={1.55}>
              Use email login. If you leave the password blank, we will send a
              magic link.
            </Typography>
          </div>

          <TextField
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            size="small"
            fullWidth
          />

          <TextField
            label="Password (optional)"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            type="password"
            size="small"
            fullWidth
          />

          {notice && (
            <Alert
              severity={notice.kind === "error" ? "error" : notice.kind === "success" ? "success" : "info"}
              variant="outlined"
            >
              {notice.message}
            </Alert>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <MuiLink component={Link} href="/admin/setup" underline="hover" variant="body2">
              First time setup
            </MuiLink>
            <Button variant="contained" onClick={onSubmit} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </div>
  )
}
