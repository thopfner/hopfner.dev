"use client"

import { useCallback } from "react"
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { IconPlus, IconX } from "@tabler/icons-react"
import {
  asString,
  asRecord,
  asArray,
} from "../payload"
import { LinkMenuField } from "../fields/link-menu-field"
import type { ContentEditorProps } from "../types"
import { useBufferedField } from "../hooks/use-buffered-field"
import { FooterCardRow } from "./footer-card-row"

const EMPTY_CARD = {
  title: "",
  body: "",
  linksMode: "flat",
  links: [{ label: "New link", href: "#" }],
  groups: [],
  subscribe: { enabled: false, placeholder: "Email Address", buttonLabel: "Subscribe" },
  ctaPrimary: { label: "", href: "" },
  ctaSecondary: { label: "", href: "" },
} as const

export function FooterGridEditor({ content, onContentChange, linkMenuProps }: ContentEditorProps) {
  const footerCards = asArray<Record<string, unknown>>(content.cards)
  const footerLegal = asRecord(content.legal)
  const footerLegalLinks = asArray<Record<string, unknown>>(footerLegal.links)

  // ---- Buffered text fields (shell-level) ----

  const brandTextField = useBufferedField(
    asString(content.brandText),
    useCallback(
      (v: string) => onContentChange((c) => ({ ...c, brandText: v })),
      [onContentChange]
    ),
    300
  )

  const copyrightField = useBufferedField(
    asString(footerLegal.copyright),
    useCallback(
      (v: string) =>
        onContentChange((c) => {
          const legal = asRecord(c.legal)
          return { ...c, legal: { ...legal, copyright: v } }
        }),
      [onContentChange]
    ),
    300
  )

  // ---- Card callbacks (stable) ----

  const handleAddCard = useCallback(() => {
    onContentChange((c) => ({
      ...c,
      cards: [...asArray<Record<string, unknown>>(c.cards), { ...EMPTY_CARD }],
    }))
  }, [onContentChange])

  const handlePatchCard = useCallback(
    (index: number, patch: Record<string, unknown>) => {
      onContentChange((c) => {
        const cards = asArray<Record<string, unknown>>(c.cards).slice()
        const existing = asRecord(cards[index])
        cards[index] = { ...existing, ...patch }
        return { ...c, cards }
      })
    },
    [onContentChange]
  )

  const handleRemoveCard = useCallback(
    (index: number) => {
      onContentChange((c) => ({
        ...c,
        cards: asArray<Record<string, unknown>>(c.cards).filter((_, i) => i !== index),
      }))
    },
    [onContentChange]
  )

  // ---- Legal links callbacks ----

  const handleAddLegalLink = useCallback(() => {
    onContentChange((c) => {
      const legal = asRecord(c.legal)
      const links = asArray<Record<string, unknown>>(legal.links)
      return { ...c, legal: { ...legal, links: [...links, { label: "", href: "" }] } }
    })
  }, [onContentChange])

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          Footer cards (1-2)
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          disabled={footerCards.length >= 2}
          onClick={handleAddCard}
        >
          Add card
        </Button>
      </Group>

      <Stack gap="xs">
        {footerCards.map((card, idx) => (
          <FooterCardRow
            key={idx}
            index={idx}
            card={asRecord(card)}
            canRemove={footerCards.length > 1}
            onPatchCard={handlePatchCard}
            onRemoveCard={handleRemoveCard}
            linkMenuProps={linkMenuProps}
          />
        ))}
      </Stack>

      <Divider />

      <TextInput
        label="Brand watermark text"
        value={brandTextField.value}
        onChange={(e) => brandTextField.onChange(e.currentTarget.value)}
        onBlur={brandTextField.onBlur}
        placeholder="YourBrand"
      />

      <TextInput
        label="Copyright"
        value={copyrightField.value}
        onChange={(e) => copyrightField.onChange(e.currentTarget.value)}
        onBlur={copyrightField.onBlur}
        placeholder="© 2026 Your Company"
      />

      <Group justify="space-between">
        <Text size="sm" fw={600}>Legal links</Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={handleAddLegalLink}
        >
          Add legal link
        </Button>
      </Group>

      <Stack gap="xs">
        {footerLegalLinks.map((lnk, idx) => {
          const r = asRecord(lnk)
          return (
            <Group key={idx} grow align="end">
              <TextInput
                label="Label"
                value={asString(r.label)}
                onChange={(e) => {
                  const nextLinks = footerLegalLinks.slice()
                  nextLinks[idx] = { ...r, label: e.currentTarget.value }
                  const nextLegal = { ...footerLegal, links: nextLinks }
                  onContentChange((c) => ({ ...c, legal: nextLegal }))
                }}
              />
              <LinkMenuField
                label="Link"
                value={asString(r.href)}
                onChange={(nextHref) => {
                  const nextLinks = footerLegalLinks.slice()
                  nextLinks[idx] = { ...r, href: nextHref }
                  const nextLegal = { ...footerLegal, links: nextLinks }
                  onContentChange((c) => ({ ...c, legal: nextLegal }))
                }}
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
                aria-label="Remove legal link"
                onClick={() => {
                  const nextLinks = footerLegalLinks.filter((_, i) => i !== idx)
                  const nextLegal = { ...footerLegal, links: nextLinks }
                  onContentChange((c) => ({ ...c, legal: nextLegal }))
                }}
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
          )
        })}
      </Stack>
    </Stack>
  )
}
