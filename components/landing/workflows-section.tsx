import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export function WorkflowsSection({
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
  items: Array<{ title: string; body: string }>
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="examples-title"
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)}>
        <h2 id="examples-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <Accordion
          type="single"
          collapsible
          className="rounded-lg border border-border/60 bg-card/30 px-4 shadow-sm"
        >
          {items.map((item) => (
            <AccordionItem key={item.title} value={item.title}>
              <AccordionTrigger className="py-3 text-sm">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-muted-foreground">
                <p className="text-sm">{item.body}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
