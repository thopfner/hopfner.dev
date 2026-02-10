import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function WhyThisApproachSection({
  sectionId,
  sectionClassName,
  containerClassName,
  title,
  heading,
  bodyHtml,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  title: string
  heading: string
  bodyHtml: string
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="why-title"
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)}>
        <h2 id="why-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <Card className="gap-3 border-border/60 bg-card/40 py-4 shadow-sm">
          <CardContent className="space-y-2 px-4">
            <h3 className="text-sm font-semibold">{heading}</h3>
            <div
              className="text-sm text-muted-foreground [&_a]:underline [&_blockquote]:border-l [&_blockquote]:border-border [&_blockquote]:pl-3 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-6 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-card/30 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
