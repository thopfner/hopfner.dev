"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell, Button, Group, Text } from "@mantine/core"

import { createClient } from "@/lib/supabase/browser"

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const router = useRouter()

  async function onSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <AppShell header={{ height: 52 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Text fw={700} size="sm">
              hopfner.dev CMS
            </Text>
            <Text c="dimmed" size="xs">
              {email}
            </Text>
          </Group>
          <Group gap="xs">
            <Button
              size="xs"
              variant="default"
              component={Link}
              href="/"
              aria-label="Pages"
            >
              Pages
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={onSignOut}
              aria-label="Sign out"
            >
              Sign out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
