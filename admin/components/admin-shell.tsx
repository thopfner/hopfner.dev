"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  const pathname = usePathname()

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
          <Group
            gap={6}
            wrap="nowrap"
            style={{
              minWidth: 0,
              overflowX: "auto",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorX: "contain",
              scrollbarGutter: "stable both-edges",
            }}
          >
            {[
              { href: "/", label: "Pages", aria: "Pages" },
              { href: "/global-sections", label: "Global", aria: "Global sections" },
              { href: "/media", label: "Media", aria: "Media" },
            ].map((item) => {
              const active = pathname === item.href
              return (
                <Button
                  key={item.href}
                  size="xs"
                  variant={active ? "light" : "default"}
                  component={Link}
                  href={item.href}
                  aria-label={item.aria}
                  aria-current={active ? "page" : undefined}
                  style={{ flexShrink: 0 }}
                >
                  {item.label}
                </Button>
              )
            })}
            <Button
              size="xs"
              variant="outline"
              onClick={onSignOut}
              aria-label="Sign out"
              style={{ flexShrink: 0 }}
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
