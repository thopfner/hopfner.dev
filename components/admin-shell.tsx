"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  AppShell,
  Burger,
  Button,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconFileText,
  IconFolder,
  IconLayoutGrid,
  IconLogout,
  IconPhoto,
  IconPinnedFilled,
} from "@tabler/icons-react"

import { createClient } from "@/lib/supabase/browser"

const NAV_ITEMS = [
  { href: "/", label: "Pages", aria: "Pages", icon: IconFileText },
  { href: "/section-library", label: "Library", aria: "Section library", icon: IconLayoutGrid },
  { href: "/global-sections", label: "Global", aria: "Global sections", icon: IconFolder },
  { href: "/media", label: "Media", aria: "Media", icon: IconPhoto },
]

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const desktop = useMediaQuery("(min-width: 48em)")
  const [desktopNavOpen, setDesktopNavOpen] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navOpen = desktop ? desktopNavOpen : mobileNavOpen
  const navWidth = navOpen ? 176 : 72

  const title = useMemo(() => {
    const active = NAV_ITEMS.find((item) => item.href === pathname)
    return active?.label ?? "Admin"
  }, [pathname])

  async function onSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{
        width: navWidth,
        breakpoint: "sm",
        collapsed: {
          mobile: !mobileNavOpen,
          desktop: false,
        },
      }}
      padding={{ base: "xs", sm: "md" }}
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: "xs", sm: "md" }} justify="space-between" wrap="nowrap">
          <Group gap="sm" style={{ minWidth: 0 }} wrap="nowrap">
            <Burger
              opened={navOpen}
              onClick={() => {
                if (desktop) {
                  setDesktopNavOpen((v) => !v)
                } else {
                  setMobileNavOpen((v) => !v)
                }
              }}
              size="sm"
              aria-label={navOpen ? "Collapse navigation" : "Expand navigation"}
            />
            <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
              <IconPinnedFilled size={14} />
              <Text fw={700} size="sm" style={{ whiteSpace: "nowrap" }}>
                hopfner.dev CMS
              </Text>
            </Group>
            <Text c="dimmed" size="xs" visibleFrom="sm" truncate="end">
              {title}
            </Text>
          </Group>
          <Text c="dimmed" size="xs" visibleFrom="sm" truncate="end" maw={280}>
            {email}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap={6}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              const content = (
                <Button
                  component={Link}
                  href={item.href}
                  aria-label={item.aria}
                  variant={active ? "light" : "subtle"}
                  size="xs"
                  leftSection={<Icon size={16} />}
                  justify={navOpen ? "flex-start" : "center"}
                  fullWidth
                >
                  {navOpen ? item.label : ""}
                </Button>
              )

              if (navOpen) return <div key={item.href}>{content}</div>

              return (
                <Tooltip key={item.href} label={item.label} position="right">
                  <div>{content}</div>
                </Tooltip>
              )
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          {navOpen ? (
            <Button
              fullWidth
              size="xs"
              variant="outline"
              leftSection={<IconLogout size={14} />}
              onClick={onSignOut}
              aria-label="Sign out"
            >
              Sign out
            </Button>
          ) : (
            <Tooltip label="Sign out" position="right">
              <UnstyledButton
                onClick={onSignOut}
                aria-label="Sign out"
                style={{
                  width: "100%",
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid var(--mantine-color-gray-4)",
                  borderRadius: 6,
                }}
              >
                <IconLogout size={14} />
              </UnstyledButton>
            </Tooltip>
          )}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="admin-content">{children}</div>
      </AppShell.Main>
    </AppShell>
  )
}
