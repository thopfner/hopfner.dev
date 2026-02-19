import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { cn } from "@/lib/utils"

export function FaqSection({
  sectionId,
  sectionClassName,
  containerClassName,
  title,
  items,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  title: string
  items: Array<{ question: string; answerHtml: string; answer?: string }>
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="faq-title"
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)}>
        <h2 id="faq-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <Accordion
          type="single"
          collapsible
          className="rounded-lg border border-border/60 bg-card/30 px-4 shadow-sm"
        >
          {items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="py-3 text-sm">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-muted-foreground">
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
      </div>
    </section>
  )
}
