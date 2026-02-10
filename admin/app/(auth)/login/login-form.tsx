"use client"

import { useMemo, useState } from "react"
import {
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { createClient } from "@/lib/supabase/browser"

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
        router.replace("/")
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
    <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
      <Paper withBorder p="md" radius="md" w="100%">
        <Stack gap="sm">
          <div>
            <Title order={2} size="h3">
              Sign in
            </Title>
            <Text c="dimmed" size="sm">
              Use email login. If you leave the password blank, we will send a
              magic link.
            </Text>
          </div>

          <TextInput
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            autoComplete="email"
          />

          <PasswordInput
            label="Password (optional)"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            autoComplete="current-password"
          />

          {notice ? (
            <Text
              size="sm"
              c={
                notice.kind === "error"
                  ? "red"
                  : notice.kind === "success"
                    ? "teal"
                    : "dimmed"
              }
            >
              {notice.message}
            </Text>
          ) : null}

          <Group justify="space-between" gap="sm">
            <Anchor size="sm" component={Link} href="/setup">
              First time setup
            </Anchor>
            <Button size="sm" loading={loading} onClick={onSubmit}>
              Sign in
            </Button>
          </Group>
        </Stack>
      </Paper>
    </div>
  )
}
