"use client"

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { IconArrowDown, IconArrowUp, IconPlus, IconX } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
  inputValueFromEvent,
} from "../payload"
import { LinkMenuField } from "../fields/link-menu-field"
import { ImageFieldPicker } from "@/components/image-field-picker"
import type { ContentEditorProps } from "../types"

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

type NavLinksEditorProps = ContentEditorProps & {
  onOpenNavLogoLibrary: () => void
  uploadToCmsMedia: (file: File) => Promise<{ publicUrl: string }>
}

export function NavLinksEditor({
  content,
  onContentChange,
  onError,
  loading,
  linkMenuProps,
  onOpenNavLogoLibrary,
  uploadToCmsMedia,
}: NavLinksEditorProps) {
  const navLinks = asArray<Record<string, unknown>>(content.links)
  const navLogo = asRecord(content.logo)
  const navLogoUrl = asString(navLogo.url)
  const navLogoAlt = asString(navLogo.alt, "Site logo")
  const navLogoWidthRaw = Number(navLogo.widthPx)
  const navLogoWidth = Number.isFinite(navLogoWidthRaw)
    ? Math.min(320, Math.max(60, Math.round(navLogoWidthRaw)))
    : 140

  function applyNavLogoUrl(url: string) {
    onContentChange((c) => {
      const existing = asRecord(c.logo)
      const existingWidthRaw = Number(existing.widthPx)
      const existingWidth = Number.isFinite(existingWidthRaw)
        ? Math.min(320, Math.max(60, Math.round(existingWidthRaw)))
        : 140
      const existingAlt = asString(existing.alt, "").trim()
      return {
        ...c,
        logo: {
          ...existing,
          url,
          alt: existingAlt || "Site logo",
          widthPx: existingWidth,
        },
      }
    })
  }

  return (
    <Stack gap="sm">
      <ImageFieldPicker
        title="Logo"
        value={navLogoUrl}
        urlLabel="Logo URL"
        placeholder="https://.../logo.png"
        onChange={applyNavLogoUrl}
        onRemove={() =>
          onContentChange((c) => {
            const existing = asRecord(c.logo)
            return {
              ...c,
              logo: {
                ...existing,
                url: "",
              },
            }
          })
        }
        onUploadFile={async (file) => {
          const { publicUrl } = await uploadToCmsMedia(file)
          applyNavLogoUrl(publicUrl)
        }}
        onChooseFromLibrary={() => onOpenNavLogoLibrary()}
        disabled={loading}
        onError={onError}
        withinPortal={false}
      >
        <TextInput
          label="Alt text"
          value={navLogoAlt}
          onChange={(e) => {
            const nextValue = inputValueFromEvent(e)
            onContentChange((c) => {
              const existing = asRecord(c.logo)
              return {
                ...c,
                logo: {
                  ...existing,
                  alt: nextValue,
                },
              }
            })
          }}
          placeholder="Site logo"
        />

        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="sm">Width</Text>
            <Text size="sm" c="dimmed">
              {navLogoWidth}px
            </Text>
          </Group>
          <Slider
            min={60}
            max={320}
            step={1}
            value={navLogoWidth}
            onChange={(nextWidth) =>
              onContentChange((c) => {
                const existing = asRecord(c.logo)
                return {
                  ...c,
                  logo: {
                    ...existing,
                    widthPx: nextWidth,
                  },
                }
              })
            }
          />
        </Stack>
      </ImageFieldPicker>

      <Group justify="space-between">
        <Text size="sm" fw={600}>
          Links
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            onContentChange((c) => ({
              ...c,
              links: [...navLinks, { label: "", href: "", anchorId: "" }],
            }))
          }
        >
          Add link
        </Button>
      </Group>
      <Stack gap="xs">
        {navLinks.map((lnk, idx) => {
          const r = asRecord(lnk)
          return (
            <Paper key={idx} withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Badge size="sm" variant="default">
                    Link {idx + 1}
                  </Badge>
                  <Group gap="xs">
                    <ActionIcon
                      variant="default"
                      aria-label="Move link up"
                      disabled={idx === 0}
                      onClick={() =>
                        onContentChange((c) => ({
                          ...c,
                          links: moveItem(navLinks, idx, idx - 1),
                        }))
                      }
                    >
                      <IconArrowUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      aria-label="Move link down"
                      disabled={idx === navLinks.length - 1}
                      onClick={() =>
                        onContentChange((c) => ({
                          ...c,
                          links: moveItem(navLinks, idx, idx + 1),
                        }))
                      }
                    >
                      <IconArrowDown size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      aria-label="Remove link"
                      onClick={() =>
                        onContentChange((c) => ({
                          ...c,
                          links: navLinks.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <TextInput
                    label="Label"
                    value={asString(r.label)}
                    onChange={(e) => {
                      const next = navLinks.slice()
                      next[idx] = { ...r, label: inputValueFromEvent(e) }
                      onContentChange((c) => ({ ...c, links: next }))
                    }}
                  />
                  <LinkMenuField
                    label="Link"
                    value={asString(r.href)}
                    onChange={(nextHref) => {
                      const next = navLinks.slice()
                      next[idx] = { ...r, href: nextHref }
                      onContentChange((c) => ({ ...c, links: next }))
                    }}
                    currentPageId={linkMenuProps.currentPageId}
                    pages={linkMenuProps.pages}
                    pagesLoading={linkMenuProps.pagesLoading}
                    anchorsByPageId={linkMenuProps.anchorsByPageId}
                    anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
                    ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
                    ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
                  />
                </SimpleGrid>
                <TextInput
                  label="Anchor target"
                  placeholder="e.g. services-heading"
                  value={asString(r.anchorId)}
                  onChange={(e) => {
                    const next = navLinks.slice()
                    next[idx] = { ...r, anchorId: inputValueFromEvent(e) }
                    onContentChange((c) => ({ ...c, links: next }))
                  }}
                />
              </Stack>
            </Paper>
          )
        })}
      </Stack>
    </Stack>
  )
}
