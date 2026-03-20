"use client"

import React, { useCallback } from "react"
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@/components/mui-compat"
import { IconPlus, IconX } from "@tabler/icons-react"
import { asString, asRecord, asArray } from "../payload"
import {
  getFooterCardCtaEnabled,
  setFooterCardCtaEnabled,
} from "@/lib/cms/cta-visibility"
import { LinkMenuField } from "../fields/link-menu-field"
import type { LinkMenuResourceProps } from "../types"
import { useBufferedField } from "../hooks/use-buffered-field"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FOOTER_LINKS_MODE_OPTIONS = [
  { label: "Flat links", value: "flat" },
  { label: "Grouped links", value: "grouped" },
] as const

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type FooterCardRowProps = {
  index: number
  card: Record<string, unknown>
  canRemove: boolean
  onPatchCard: (index: number, patch: Record<string, unknown>) => void
  onRemoveCard: (index: number) => void
  linkMenuProps: LinkMenuResourceProps
}

// ---------------------------------------------------------------------------
// Flat link sub-row (memoized)
// ---------------------------------------------------------------------------

type FlatLinkRowProps = {
  linkIdx: number
  link: Record<string, unknown>
  onPatchLink: (linkIdx: number, patch: Record<string, unknown>) => void
  onRemoveLink: (linkIdx: number) => void
  linkMenuProps: LinkMenuResourceProps
}

const FlatLinkRow = React.memo(function FlatLinkRow({
  linkIdx,
  link,
  onPatchLink,
  onRemoveLink,
  linkMenuProps,
}: FlatLinkRowProps) {
  const labelField = useBufferedField(
    asString(link.label),
    useCallback((v: string) => onPatchLink(linkIdx, { label: v }), [onPatchLink, linkIdx]),
    300
  )

  const handleHrefChange = useCallback(
    (nextHref: string) => onPatchLink(linkIdx, { href: nextHref }),
    [onPatchLink, linkIdx]
  )

  const handleRemove = useCallback(() => onRemoveLink(linkIdx), [onRemoveLink, linkIdx])

  return (
    <Paper withBorder p="xs" radius="md">
      <Group grow align="end">
        <TextInput
          label="Label"
          value={labelField.value}
          onChange={(e) => labelField.onChange(e.currentTarget.value)}
          onBlur={labelField.onBlur}
        />
        <LinkMenuField
          label="Link"
          value={asString(link.href)}
          onChange={handleHrefChange}
          currentPageId={linkMenuProps.currentPageId}
          pages={linkMenuProps.pages}
          pagesLoading={linkMenuProps.pagesLoading}
          anchorsByPageId={linkMenuProps.anchorsByPageId}
          anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
          ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
          ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
        />
        <ActionIcon
          variant="default"
          aria-label="Remove link"
          onClick={handleRemove}
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  )
})

// ---------------------------------------------------------------------------
// Group link sub-row (memoized)
// ---------------------------------------------------------------------------

type GroupLinkRowProps = {
  linkIdx: number
  link: Record<string, unknown>
  onPatchGroupLink: (linkIdx: number, patch: Record<string, unknown>) => void
  onRemoveGroupLink: (linkIdx: number) => void
  linkMenuProps: LinkMenuResourceProps
}

const GroupLinkRow = React.memo(function GroupLinkRow({
  linkIdx,
  link,
  onPatchGroupLink,
  onRemoveGroupLink,
  linkMenuProps,
}: GroupLinkRowProps) {
  const labelField = useBufferedField(
    asString(link.label),
    useCallback(
      (v: string) => onPatchGroupLink(linkIdx, { label: v }),
      [onPatchGroupLink, linkIdx]
    ),
    300
  )

  const handleHrefChange = useCallback(
    (nextHref: string) => onPatchGroupLink(linkIdx, { href: nextHref }),
    [onPatchGroupLink, linkIdx]
  )

  const handleRemove = useCallback(
    () => onRemoveGroupLink(linkIdx),
    [onRemoveGroupLink, linkIdx]
  )

  return (
    <Group grow align="end">
      <TextInput
        label="Label"
        value={labelField.value}
        onChange={(e) => labelField.onChange(e.currentTarget.value)}
        onBlur={labelField.onBlur}
      />
      <LinkMenuField
        label="Link"
        value={asString(link.href)}
        onChange={handleHrefChange}
        currentPageId={linkMenuProps.currentPageId}
        pages={linkMenuProps.pages}
        pagesLoading={linkMenuProps.pagesLoading}
        anchorsByPageId={linkMenuProps.anchorsByPageId}
        anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
        ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
        ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
      />
      <ActionIcon
        variant="default"
        aria-label="Remove group link"
        onClick={handleRemove}
      >
        <IconX size={16} />
      </ActionIcon>
    </Group>
  )
})

// ---------------------------------------------------------------------------
// Link group sub-component (memoized)
// ---------------------------------------------------------------------------

type LinkGroupRowProps = {
  groupIdx: number
  group: Record<string, unknown>
  onPatchGroup: (groupIdx: number, patch: Record<string, unknown>) => void
  onRemoveGroup: (groupIdx: number) => void
  linkMenuProps: LinkMenuResourceProps
}

const LinkGroupRow = React.memo(function LinkGroupRow({
  groupIdx,
  group,
  onPatchGroup,
  onRemoveGroup,
  linkMenuProps,
}: LinkGroupRowProps) {
  const groupLinks = asArray<Record<string, unknown>>(group.links)

  const titleField = useBufferedField(
    asString(group.title),
    useCallback(
      (v: string) => onPatchGroup(groupIdx, { title: v }),
      [onPatchGroup, groupIdx]
    ),
    300
  )

  const handleRemoveGroup = useCallback(
    () => onRemoveGroup(groupIdx),
    [onRemoveGroup, groupIdx]
  )

  const handleAddGroupLink = useCallback(() => {
    onPatchGroup(groupIdx, { links: [...groupLinks, { label: "", href: "" }] })
  }, [onPatchGroup, groupIdx, groupLinks])

  const handlePatchGroupLink = useCallback(
    (linkIdx: number, patch: Record<string, unknown>) => {
      const r = asRecord(groupLinks[linkIdx])
      const nextLinks = groupLinks.slice()
      nextLinks[linkIdx] = { ...r, ...patch }
      onPatchGroup(groupIdx, { links: nextLinks })
    },
    [onPatchGroup, groupIdx, groupLinks]
  )

  const handleRemoveGroupLink = useCallback(
    (linkIdx: number) => {
      const nextLinks = groupLinks.filter((_, i) => i !== linkIdx)
      onPatchGroup(groupIdx, { links: nextLinks })
    },
    [onPatchGroup, groupIdx, groupLinks]
  )

  return (
    <Paper withBorder p="xs" radius="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <TextInput
            label="Group title"
            value={titleField.value}
            onChange={(e) => titleField.onChange(e.currentTarget.value)}
            onBlur={titleField.onBlur}
          />
          <ActionIcon
            variant="default"
            aria-label="Remove group"
            onClick={handleRemoveGroup}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>

        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={handleAddGroupLink}
        >
          Add group link
        </Button>

        {groupLinks.map((lnk, linkIdx) => {
          const link = asRecord(lnk)
          return (
            <GroupLinkRow
              key={linkIdx}
              linkIdx={linkIdx}
              link={link}
              onPatchGroupLink={handlePatchGroupLink}
              onRemoveGroupLink={handleRemoveGroupLink}
              linkMenuProps={linkMenuProps}
            />
          )
        })}
      </Stack>
    </Paper>
  )
})

// ---------------------------------------------------------------------------
// Footer card row (main export)
// ---------------------------------------------------------------------------

export const FooterCardRow = React.memo(function FooterCardRow({
  index,
  card,
  canRemove,
  onPatchCard,
  onRemoveCard,
  linkMenuProps,
}: FooterCardRowProps) {
  const r = asRecord(card)
  const cardTitle = asString(r.title)
  const linksMode = asString(r.linksMode) === "grouped" ? "grouped" : "flat"
  const flatLinks = asArray<Record<string, unknown>>(r.links)
  const groups = asArray<Record<string, unknown>>(r.groups)
  const subscribe = asRecord(r.subscribe)
  const ctaPrimary = asRecord(r.ctaPrimary)
  const ctaSecondary = asRecord(r.ctaSecondary)

  // ---- Buffered text fields ----

  const titleField = useBufferedField(
    cardTitle,
    useCallback((v: string) => onPatchCard(index, { title: v }), [onPatchCard, index]),
    300
  )

  const bodyField = useBufferedField(
    asString(r.body),
    useCallback((v: string) => onPatchCard(index, { body: v }), [onPatchCard, index]),
    300
  )

  const subscribePlaceholderField = useBufferedField(
    asString(subscribe.placeholder),
    useCallback(
      (v: string) => onPatchCard(index, { subscribe: { ...subscribe, placeholder: v } }),
      [onPatchCard, index, subscribe]
    ),
    300
  )

  const subscribeButtonLabelField = useBufferedField(
    asString(subscribe.buttonLabel),
    useCallback(
      (v: string) => onPatchCard(index, { subscribe: { ...subscribe, buttonLabel: v } }),
      [onPatchCard, index, subscribe]
    ),
    300
  )

  const ctaPrimaryLabelField = useBufferedField(
    asString(ctaPrimary.label),
    useCallback(
      (v: string) => onPatchCard(index, { ctaPrimary: { ...ctaPrimary, label: v } }),
      [onPatchCard, index, ctaPrimary]
    ),
    300
  )

  const ctaSecondaryLabelField = useBufferedField(
    asString(ctaSecondary.label),
    useCallback(
      (v: string) => onPatchCard(index, { ctaSecondary: { ...ctaSecondary, label: v } }),
      [onPatchCard, index, ctaSecondary]
    ),
    300
  )

  // ---- Stable callbacks ----

  const handleRemove = useCallback(() => onRemoveCard(index), [onRemoveCard, index])

  const handleLinksModeChange = useCallback(
    (mode: string) => {
      onPatchCard(index, { linksMode: mode === "grouped" ? "grouped" : "flat" })
    },
    [onPatchCard, index]
  )

  const handleSubscribeToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPatchCard(index, {
        subscribe: {
          ...subscribe,
          enabled: e.currentTarget.checked,
          placeholder: asString(subscribe.placeholder) || "Email Address",
          buttonLabel: asString(subscribe.buttonLabel) || "Subscribe",
        },
      })
    },
    [onPatchCard, index, subscribe]
  )

  // -- Flat links callbacks --

  const handleAddFlatLink = useCallback(() => {
    onPatchCard(index, { links: [...flatLinks, { label: "", href: "" }] })
  }, [onPatchCard, index, flatLinks])

  const handlePatchFlatLink = useCallback(
    (linkIdx: number, patch: Record<string, unknown>) => {
      const link = asRecord(flatLinks[linkIdx])
      const nextLinks = flatLinks.slice()
      nextLinks[linkIdx] = { ...link, ...patch }
      onPatchCard(index, { links: nextLinks })
    },
    [onPatchCard, index, flatLinks]
  )

  const handleRemoveFlatLink = useCallback(
    (linkIdx: number) => {
      const nextLinks = flatLinks.filter((_, i) => i !== linkIdx)
      onPatchCard(index, { links: nextLinks })
    },
    [onPatchCard, index, flatLinks]
  )

  // -- Groups callbacks --

  const handleAddGroup = useCallback(() => {
    onPatchCard(index, {
      groups: [...groups, { title: "", links: [{ label: "", href: "" }] }],
    })
  }, [onPatchCard, index, groups])

  const handlePatchGroup = useCallback(
    (groupIdx: number, patch: Record<string, unknown>) => {
      const group = asRecord(groups[groupIdx])
      const nextGroups = groups.slice()
      nextGroups[groupIdx] = { ...group, ...patch }
      onPatchCard(index, { groups: nextGroups })
    },
    [onPatchCard, index, groups]
  )

  const handleRemoveGroup = useCallback(
    (groupIdx: number) => {
      const nextGroups = groups.filter((_, i) => i !== groupIdx)
      onPatchCard(index, { groups: nextGroups })
    },
    [onPatchCard, index, groups]
  )

  // -- CTA href callbacks --

  const handleCtaPrimaryHrefChange = useCallback(
    (nextHref: string) => {
      onPatchCard(index, { ctaPrimary: { ...ctaPrimary, href: nextHref } })
    },
    [onPatchCard, index, ctaPrimary]
  )

  const handleCtaSecondaryHrefChange = useCallback(
    (nextHref: string) => {
      onPatchCard(index, { ctaSecondary: { ...ctaSecondary, href: nextHref } })
    },
    [onPatchCard, index, ctaSecondary]
  )

  return (
    <Paper withBorder p="sm" radius="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Badge size="sm" variant="default">
            {cardTitle.trim() || "Footer"}
          </Badge>
          <ActionIcon
            variant="default"
            aria-label="Remove card"
            disabled={!canRemove}
            onClick={handleRemove}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>

        <TextInput
          label="Card title (optional)"
          value={titleField.value}
          onChange={(e) => titleField.onChange(e.currentTarget.value)}
          onBlur={titleField.onBlur}
        />

        <Textarea
          label="Body"
          value={bodyField.value}
          onChange={(e) => bodyField.onChange(e.currentTarget.value)}
          onBlur={bodyField.onBlur}
          autosize
          minRows={2}
        />

        <SegmentedControl
          size="xs"
          value={linksMode}
          data={FOOTER_LINKS_MODE_OPTIONS as unknown as { label: string; value: string }[]}
          onChange={handleLinksModeChange}
        />

        {linksMode === "flat" ? (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={500}>Links</Text>
              <Button
                size="xs"
                variant="default"
                leftSection={<IconPlus size={14} />}
                onClick={handleAddFlatLink}
              >
                Add link
              </Button>
            </Group>
            {flatLinks.map((lnk, linkIdx) => {
              const link = asRecord(lnk)
              return (
                <FlatLinkRow
                  key={linkIdx}
                  linkIdx={linkIdx}
                  link={link}
                  onPatchLink={handlePatchFlatLink}
                  onRemoveLink={handleRemoveFlatLink}
                  linkMenuProps={linkMenuProps}
                />
              )
            })}
          </Stack>
        ) : (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={500}>Link groups</Text>
              <Button
                size="xs"
                variant="default"
                leftSection={<IconPlus size={14} />}
                onClick={handleAddGroup}
              >
                Add group
              </Button>
            </Group>

            {groups.map((grp, groupIdx) => {
              const group = asRecord(grp)
              return (
                <LinkGroupRow
                  key={groupIdx}
                  groupIdx={groupIdx}
                  group={group}
                  onPatchGroup={handlePatchGroup}
                  onRemoveGroup={handleRemoveGroup}
                  linkMenuProps={linkMenuProps}
                />
              )
            })}
          </Stack>
        )}

        <Group align="center" gap="xs">
          <Checkbox
            label="Show subscribe input"
            checked={subscribe.enabled === true}
            onChange={handleSubscribeToggle}
          />
        </Group>

        {subscribe.enabled === true ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <TextInput
              label="Subscribe placeholder"
              value={subscribePlaceholderField.value}
              onChange={(e) => subscribePlaceholderField.onChange(e.currentTarget.value)}
              onBlur={subscribePlaceholderField.onBlur}
            />
            <TextInput
              label="Subscribe button label"
              value={subscribeButtonLabelField.value}
              onChange={(e) => subscribeButtonLabelField.onChange(e.currentTarget.value)}
              onBlur={subscribeButtonLabelField.onBlur}
            />
          </SimpleGrid>
        ) : null}

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Group gap="xs" style={{ gridColumn: "1 / -1" }}>
            <Checkbox
              label="Show CTA 1"
              checked={getFooterCardCtaEnabled(r, "ctaPrimary")}
              onChange={(e) => {
                const updated = setFooterCardCtaEnabled(r, "ctaPrimary", e.currentTarget.checked)
                onPatchCard(index, { ctaPrimary: updated.ctaPrimary })
              }}
            />
          </Group>
          <TextInput
            label="CTA 1 label"
            value={ctaPrimaryLabelField.value}
            onChange={(e) => ctaPrimaryLabelField.onChange(e.currentTarget.value)}
            onBlur={ctaPrimaryLabelField.onBlur}
            disabled={!getFooterCardCtaEnabled(r, "ctaPrimary")}
          />
          <LinkMenuField
            label="CTA 1 link"
            value={asString(ctaPrimary.href)}
            onChange={handleCtaPrimaryHrefChange}
            currentPageId={linkMenuProps.currentPageId}
            pages={linkMenuProps.pages}
            pagesLoading={linkMenuProps.pagesLoading}
            anchorsByPageId={linkMenuProps.anchorsByPageId}
            anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
            ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
            ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
            disabled={!getFooterCardCtaEnabled(r, "ctaPrimary")}
          />
          <Group gap="xs" style={{ gridColumn: "1 / -1" }}>
            <Checkbox
              label="Show CTA 2"
              checked={getFooterCardCtaEnabled(r, "ctaSecondary")}
              onChange={(e) => {
                const updated = setFooterCardCtaEnabled(r, "ctaSecondary", e.currentTarget.checked)
                onPatchCard(index, { ctaSecondary: updated.ctaSecondary })
              }}
            />
          </Group>
          <TextInput
            label="CTA 2 label"
            value={ctaSecondaryLabelField.value}
            onChange={(e) => ctaSecondaryLabelField.onChange(e.currentTarget.value)}
            onBlur={ctaSecondaryLabelField.onBlur}
            disabled={!getFooterCardCtaEnabled(r, "ctaSecondary")}
          />
          <LinkMenuField
            label="CTA 2 link"
            value={asString(ctaSecondary.href)}
            onChange={handleCtaSecondaryHrefChange}
            currentPageId={linkMenuProps.currentPageId}
            pages={linkMenuProps.pages}
            pagesLoading={linkMenuProps.pagesLoading}
            anchorsByPageId={linkMenuProps.anchorsByPageId}
            anchorsLoadingByPageId={linkMenuProps.anchorsLoadingByPageId}
            ensurePagesLoaded={linkMenuProps.ensurePagesLoaded}
            ensureAnchorsLoaded={linkMenuProps.ensureAnchorsLoaded}
            disabled={!getFooterCardCtaEnabled(r, "ctaSecondary")}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  )
})
