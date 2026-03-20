"use client"

import { useState, useMemo } from "react"
import {
  Box,
  Button,
  Group,
  Loader,
  Menu,
  Text,
  TextInput,
} from "@/components/mui-compat"
import {
  IconChevronDown,
  IconChevronLeft,
  IconExternalLink,
  IconHash,
  IconLink as IconLinkIcon,
} from "@tabler/icons-react"
import type { CmsPageRow, LinkMenuScreen, ParsedLinkTarget } from "../types"
import { parseHref, buildHref, inputValueFromEvent } from "../payload"

export function LinkMenuField({
  label,
  value,
  onChange,
  currentPageId,
  pages,
  pagesLoading,
  anchorsByPageId,
  anchorsLoadingByPageId,
  ensurePagesLoaded,
  ensureAnchorsLoaded,
  disabled,
}: {
  label: string
  value: string
  onChange: (nextHref: string) => void
  currentPageId: string
  pages: CmsPageRow[]
  pagesLoading: boolean
  anchorsByPageId: Record<string, string[]>
  anchorsLoadingByPageId: Record<string, boolean>
  ensurePagesLoaded: () => Promise<void>
  ensureAnchorsLoaded: (pageId: string) => Promise<void>
  disabled?: boolean
}) {
  const [opened, setOpened] = useState(false)
  const [screen, setScreen] = useState<LinkMenuScreen>("root")
  const [selectedPageId, setSelectedPageId] = useState("")
  const [customDraft, setCustomDraft] = useState("")

  const parsed = useMemo(() => parseHref(value), [value])
  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null

  const thisPageAnchors = anchorsByPageId[currentPageId] ?? []
  const thisPageAnchorsLoading = anchorsLoadingByPageId[currentPageId] ?? false
  const selectedPageAnchors = selectedPageId ? anchorsByPageId[selectedPageId] ?? [] : []
  const selectedPageAnchorsLoading = selectedPageId ? anchorsLoadingByPageId[selectedPageId] ?? false : false

  function reset() {
    setScreen("root")
    setSelectedPageId("")
    setCustomDraft("")
  }

  function closeMenu() {
    setOpened(false)
    reset()
  }

  function setHref(nextHref: string) {
    if (nextHref !== value) onChange(nextHref)
    closeMenu()
  }

  function enterThisPage() {
    setScreen("this_page")
    void ensureAnchorsLoaded(currentPageId)
  }

  function enterPages() {
    setScreen("pages")
    void ensurePagesLoaded()
  }

  function enterCustom() {
    setScreen("custom")
    setCustomDraft(parsed.kind === "custom" ? parsed.href : "")
  }

  return (
    <Menu
      withinPortal={false}
      position="bottom-start"
      shadow="md"
      width={340}
      opened={opened}
      onChange={(nextOpened: boolean) => {
        setOpened(nextOpened)
        if (nextOpened) {
          void ensurePagesLoaded()
        } else {
          reset()
        }
      }}
    >
      <Menu.Target>
        <TextInput
          label={label}
          value={value}
          readOnly
          placeholder="Choose link..."
          rightSection={<IconChevronDown size={16} />}
          rightSectionPointerEvents="none"
          disabled={disabled}
        />
      </Menu.Target>

      <Menu.Dropdown>
        {screen === "root" ? (
          <>
            <Menu.Label>Choose Link</Menu.Label>
            <Menu.Item leftSection={<IconHash size={16} />} closeMenuOnClick={false} onClick={enterThisPage}>
              This page
            </Menu.Item>
            <Menu.Item leftSection={<IconLinkIcon size={16} />} closeMenuOnClick={false} onClick={enterPages}>
              Another page
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconExternalLink size={16} />} closeMenuOnClick={false} onClick={enterCustom}>
              Custom URL...
            </Menu.Item>
            <Menu.Item c="dimmed" closeMenuOnClick={false} onClick={() => setHref("")}>
              Clear link
            </Menu.Item>
          </>
        ) : null}

        {screen === "this_page" ? (
          <>
            <Menu.Item leftSection={<IconChevronLeft size={16} />} closeMenuOnClick={false} onClick={() => setScreen("root")}>
              Back
            </Menu.Item>
            <Menu.Label>This page sections</Menu.Label>
            {thisPageAnchorsLoading ? (
              <Menu.Item closeMenuOnClick={false} disabled leftSection={<Loader size="xs" />}>
                Loading...
              </Menu.Item>
            ) : thisPageAnchors.length ? (
              <Box style={{ maxHeight: 260, overflowY: "auto" }}>
                {thisPageAnchors.map((k) => (
                  <Menu.Item key={k} onClick={() => setHref(buildHref({ kind: "this_page_anchor", anchor: k }))}>
                    #{k}
                  </Menu.Item>
                ))}
              </Box>
            ) : (
              <Menu.Item closeMenuOnClick={false} disabled>
                No keyed sections on this page
              </Menu.Item>
            )}
          </>
        ) : null}

        {screen === "pages" ? (
          <>
            <Menu.Item leftSection={<IconChevronLeft size={16} />} closeMenuOnClick={false} onClick={() => setScreen("root")}>
              Back
            </Menu.Item>
            <Menu.Label>Pages</Menu.Label>
            {pagesLoading ? (
              <Menu.Item closeMenuOnClick={false} disabled leftSection={<Loader size="xs" />}>
                Loading...
              </Menu.Item>
            ) : pages.length ? (
              <Box style={{ maxHeight: 260, overflowY: "auto" }}>
                {pages.map((p) => (
                  <Menu.Item
                    key={p.id}
                    closeMenuOnClick={false}
                    onClick={() => {
                      setSelectedPageId(p.id)
                      setScreen("page_actions")
                    }}
                  >
                    {p.title} ({p.slug})
                  </Menu.Item>
                ))}
              </Box>
            ) : (
              <Menu.Item closeMenuOnClick={false} disabled>
                No pages found
              </Menu.Item>
            )}
          </>
        ) : null}

        {screen === "page_actions" ? (
          <>
            <Menu.Item leftSection={<IconChevronLeft size={16} />} closeMenuOnClick={false} onClick={() => setScreen("pages")}>
              Back
            </Menu.Item>
            <Menu.Label>
              {selectedPage ? `${selectedPage.title} (${selectedPage.slug})` : "Page"}
            </Menu.Label>
            <Menu.Item
              disabled={!selectedPage}
              onClick={() => {
                if (!selectedPage) return
                setHref(buildHref({ kind: "page_anchor", pageSlug: selectedPage.slug, anchor: "top" }))
              }}
            >
              Top of page
            </Menu.Item>
            <Menu.Item
              disabled={!selectedPage}
              closeMenuOnClick={false}
              onClick={() => {
                if (!selectedPage) return
                setScreen("page_sections")
                void ensureAnchorsLoaded(selectedPage.id)
              }}
            >
              Section on this page
            </Menu.Item>
          </>
        ) : null}

        {screen === "page_sections" ? (
          <>
            <Menu.Item leftSection={<IconChevronLeft size={16} />} closeMenuOnClick={false} onClick={() => setScreen("page_actions")}>
              Back
            </Menu.Item>
            <Menu.Label>Sections</Menu.Label>
            {!selectedPage ? (
              <Menu.Item closeMenuOnClick={false} disabled>
                Pick a page first
              </Menu.Item>
            ) : selectedPageAnchorsLoading ? (
              <Menu.Item closeMenuOnClick={false} disabled leftSection={<Loader size="xs" />}>
                Loading...
              </Menu.Item>
            ) : selectedPageAnchors.length ? (
              <Box style={{ maxHeight: 260, overflowY: "auto" }}>
                {selectedPageAnchors.map((k) => (
                  <Menu.Item
                    key={k}
                    onClick={() => {
                      if (!selectedPage) return
                      setHref(buildHref({ kind: "page_anchor", pageSlug: selectedPage.slug, anchor: k }))
                    }}
                  >
                    #{k}
                  </Menu.Item>
                ))}
              </Box>
            ) : (
              <Menu.Item closeMenuOnClick={false} disabled>
                No keyed sections on this page
              </Menu.Item>
            )}
          </>
        ) : null}

        {screen === "custom" ? (
          <Box p="sm">
            <Group justify="space-between" mb="xs">
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconChevronLeft size={14} />}
                onClick={() => setScreen("root")}
              >
                Back
              </Button>
              <Text size="xs" c="dimmed">
                Custom URL
              </Text>
            </Group>
            <TextInput
              label="Link"
              value={customDraft}
              onChange={(e) => setCustomDraft(inputValueFromEvent(e))}
              placeholder="https://... or mailto:... or /about#pricing"
              mb="xs"
            />
            <Group justify="space-between">
              <Group gap="xs">
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => setCustomDraft((v) => (v.startsWith("mailto:") ? v : `mailto:${v}`))}
                >
                  mailto:
                </Button>
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => setCustomDraft((v) => (v.startsWith("tel:") ? v : `tel:${v}`))}
                >
                  tel:
                </Button>
              </Group>
              <Button size="xs" onClick={() => setHref(customDraft.trim())}>
                Apply
              </Button>
            </Group>
          </Box>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  )
}
