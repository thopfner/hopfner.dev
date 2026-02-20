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
    <AppShell header={{ height: 52 }} padding={{ base: "xs", sm: "md" }}>
      <AppShell.Header>
        <Group h="100%" px={{ base: "xs", sm: "md" }} justify="space-between" wrap="nowrap">
          <Group gap="sm" style={{ minWidth: 0 }}>
            <Text fw={700} size="sm" style={{ whiteSpace: "nowrap" }}>
              hopfner.dev CMS
            </Text>
            <Text c="dimmed" size="xs" visibleFrom="sm" truncate="end">
              {email}
            </Text>
          </Group>
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0, overflowX: "auto" }}>
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
              variant="default"
              component={Link}
              href="/global-sections"
              aria-label="Global sections"
            >
              Global
            </Button>
            <Button
              size="xs"
              variant="default"
              component={Link}
              href="/media"
              aria-label="Media"
            >
              Media
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
      <AppShell.Main>
        <div className="admin-content">{children}</div>
      </AppShell.Main>
    </AppShell>
  )
}
