import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
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
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="examples-title"
    style={sectionStyle}
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)} style={containerStyle}>
        <h2 id="examples-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <Accordion
          type="single"
          collapsible
          className="rounded-lg border border-border/60 bg-card/30 px-4"
          style={panelStyle}
        >
          {items.map((item) => (
            <AccordionItem key={item.title} value={item.title}>
              <AccordionTrigger className="py-3 text-sm">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-muted-foreground">
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
      </div>
    </section>
  )
}
