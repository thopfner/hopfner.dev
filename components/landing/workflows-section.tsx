import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function WorkflowsSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  items,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
  items: Array<{ title: string; body: string; bodyHtml?: string }>
}) {
  return (
    <SectionShell
      id={sectionId}
      labelledBy="examples-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
    >
      <SectionHeading id="examples-title" title={title} />

      <Accordion
        type="single"
        collapsible
        className="surface-panel px-4"
        style={panelStyle}
      >
        {items.map((item) => (
          <AccordionItem key={item.title} value={item.title}>
            <AccordionTrigger className="py-3.5 text-sm sm:text-base">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-muted-foreground">
              {item.bodyHtml?.trim() ? (
                <div
                  className={cn("text-sm", RICH_TEXT_CLASS)}
                  dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                />
              ) : (
                <p className="text-sm">{item.body}</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  )
}
