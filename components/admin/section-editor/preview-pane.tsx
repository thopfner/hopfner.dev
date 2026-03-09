"use client"

import { memo, useDeferredValue, useMemo } from "react"
import { Text } from "@/components/mui-compat"
import { SectionPreview } from "@/components/admin/section-preview"
import type { FormattingState } from "@/components/admin/formatting-controls"

type PreviewPaneProps = {
  sectionType: string | null
  content: Record<string, unknown>
  formatting: FormattingState
  title: string
  subtitle: string
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
  backgroundMediaUrl: string
  colorMode?: "light" | "dark"
  siteTokens?: Record<string, unknown>
}

export const PreviewPane = memo(function PreviewPane({
  sectionType,
  content,
  formatting,
  title,
  subtitle,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
  backgroundMediaUrl,
  colorMode,
  siteTokens,
}: PreviewPaneProps) {
  // Defer all preview data so typing in the left panel stays responsive
  const deferredContent = useDeferredValue(content)
  const deferredFormatting = useDeferredValue(formatting)
  const deferredTitle = useDeferredValue(title)
  const deferredSubtitle = useDeferredValue(subtitle)
  const deferredCtaPrimaryLabel = useDeferredValue(ctaPrimaryLabel)
  const deferredCtaPrimaryHref = useDeferredValue(ctaPrimaryHref)
  const deferredCtaSecondaryLabel = useDeferredValue(ctaSecondaryLabel)
  const deferredCtaSecondaryHref = useDeferredValue(ctaSecondaryHref)
  const deferredBackgroundMediaUrl = useDeferredValue(backgroundMediaUrl)

  if (!sectionType || sectionType === "nav_links") {
    return (
      <div style={{ flex: 1, minWidth: 0, borderLeft: "1px solid var(--mantine-color-dark-4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Text size="sm" c="dimmed">No preview for this section type</Text>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, minWidth: 0, borderLeft: "1px solid var(--mantine-color-dark-4)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--mantine-color-dark-4)", flexShrink: 0 }}>
        <Text size="xs" fw={500} c="dimmed">Live Preview</Text>
      </div>
      <div style={{ flex: 1, overflow: "auto", background: "var(--background)" }}>
        <SectionPreview
          sectionType={sectionType}
          content={deferredContent}
          formatting={deferredFormatting as Record<string, unknown>}
          title={deferredTitle}
          subtitle={deferredSubtitle}
          ctaPrimaryLabel={deferredCtaPrimaryLabel}
          ctaPrimaryHref={deferredCtaPrimaryHref}
          ctaSecondaryLabel={deferredCtaSecondaryLabel}
          ctaSecondaryHref={deferredCtaSecondaryHref}
          backgroundMediaUrl={deferredBackgroundMediaUrl}
          colorMode={colorMode}
          siteTokens={siteTokens}
          embedded
        />
      </div>
    </div>
  )
})
