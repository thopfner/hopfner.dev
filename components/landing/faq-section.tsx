import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { FadeIn } from "@/components/landing/motion-primitives"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { DIVIDER_CLASSES } from "@/lib/design-system/presentation"
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
  items: Array<{ question: string; answerHtml: string; answer?: string }>
  ui?: ResolvedSectionUi
}) {
  const dividerClass = ui?.dividerMode ? DIVIDER_CLASSES[ui.dividerMode] : ""
  const { cardClass, spacing } = resolveCardPresentation(ui, { mode: "accordion" })

  return (
    <SectionShell
      id={sectionId}
      labelledBy="faq-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm}
      surface={ui?.surface}
      density={ui?.density}
    >
      <FadeIn>
        <SectionHeading id="faq-title" title={title} headingTreatment={ui?.headingTreatment} />
      </FadeIn>

      <Accordion
        type="single"
        collapsible
        className={cn(cardClass, spacing.rootPadding, dividerClass)}
        style={panelStyle}
      >
        {items.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className={cn("text-sm sm:text-base", spacing.headerPadding)}>
              {item.question}
            </AccordionTrigger>
            <AccordionContent className={cn("text-muted-foreground", spacing.bodyPadding)}>
              {item.answerHtml.trim() ? (
                <div
                  className={cn("text-sm", RICH_TEXT_CLASS)}
                  dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                />
              ) : (
                <p className="text-sm">{item.answer}</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  )
}
