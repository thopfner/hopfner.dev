import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { EditableRichTextSlot } from "@/components/landing/editable-rich-text-slot"
import { EditableLinkSlot } from "@/components/landing/editable-link-slot"
import { FadeIn } from "@/components/landing/motion-primitives"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { DIVIDER_CLASSES, LABEL_STYLE_CLASSES, SUBTITLE_SIZE_CLASSES } from "@/lib/design-system/presentation"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function FaqSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  subtitle,
  eyebrow,
  items,
  ui,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
  subtitle?: string
  eyebrow?: string
  items: Array<{ question: string; answerHtml: string; answer?: string }>
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const labelStyle = ui?.labelStyle ?? "default"
  const headingId = sectionId ? `${sectionId}-heading` : "faq-title"
  const dividerClass = ui?.dividerMode ? DIVIDER_CLASSES[ui.dividerMode] : ""
  const { cardClass, spacing } = resolveCardPresentation(ui, { mode: "accordion" })

  return (
    <SectionShell
      id={sectionId}
      labelledBy={headingId}
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm}
      surface={ui?.surface}
      density={ui?.density}
    >
      <FadeIn>
        <div className="space-y-1">
          {hasEyebrow ? (
            <EditableTextSlot as="p" fieldPath="content.eyebrow" className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</EditableTextSlot>
          ) : null}
          <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} fieldPath="meta.title" />
          {hasSubtitle ? (
            <EditableTextSlot as="p" fieldPath="meta.subtitle" className={cn("max-w-2xl text-muted-foreground", SUBTITLE_SIZE_CLASSES[ui?.subtitleSize ?? "sm"])} multiline>{subtitle}</EditableTextSlot>
          ) : null}
        </div>
      </FadeIn>

      <Accordion
        type="single"
        collapsible
        className={cn(cardClass, spacing.rootPadding, dividerClass)}
        style={panelStyle}
      >
        {items.map((item, idx) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className={cn("text-sm sm:text-base", spacing.headerPadding)}>
              <EditableTextSlot as="span" fieldPath={`content.items.${idx}.question`}>{item.question}</EditableTextSlot>
            </AccordionTrigger>
            <AccordionContent className={cn("text-muted-foreground", spacing.bodyPadding)}>
              {item.answerHtml.trim() ? (
                <EditableRichTextSlot
                  richTextPath={`content.items.${idx}.answerRichText`}
                  html={item.answerHtml}
                  className={cn("text-sm", RICH_TEXT_CLASS)}
                />
              ) : (
                <EditableTextSlot as="p" fieldPath={`content.items.${idx}.answer`} className="text-sm" multiline>{item.answer}</EditableTextSlot>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  )
}
