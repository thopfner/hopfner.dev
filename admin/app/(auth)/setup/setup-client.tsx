"use client"

import { useState } from "react"
import { Button, Paper, Stack, Text, Title } from "@mantine/core"
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
      <Paper withBorder p="md" radius="md" w="100%">
        <Stack gap="sm">
          <div>
            <Title order={2} size="h3">
              One-time Setup
            </Title>
            <Text c="dimmed" size="sm">
              Signed in as {email}. If no admin exists yet, you can bootstrap
              yourself as the first admin.
            </Text>
          </div>

          {message ? (
            <Text size="sm" c="dimmed">
              {message}
            </Text>
          ) : null}

          <Button size="sm" loading={loading} onClick={onBootstrap}>
            Make me admin
          </Button>
        </Stack>
      </Paper>
    </div>
  )
}
