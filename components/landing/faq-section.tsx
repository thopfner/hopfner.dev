import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  items: Array<{ question: string; answerHtml: string }>
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
                <div
                  className="text-sm [&_a]:underline [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-6 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
