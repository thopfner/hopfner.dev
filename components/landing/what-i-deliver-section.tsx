import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function WhatIDeliverSection({
  sectionId,
  sectionClassName,
  containerClassName,
  title,
  cards,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  title: string
  cards: Array<{
    title: string
    text: string
    youGet: string[]
    bestFor: string
  }>
}) {
  return (
    <section
      id={sectionId}
      className={cn("scroll-mt-16 py-6", sectionClassName)}
      aria-labelledby="services-title"
    >
      <div className={cn("mx-auto max-w-5xl space-y-4 px-4", containerClassName)}>
        <h2 id="services-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cards.map((item) => (
            <Card
              key={item.title}
              className="gap-3 border-border/60 bg-card/40 py-4 shadow-sm"
            >
              <CardHeader className="gap-1 px-4 pb-0">
                <h3 className="text-sm font-semibold leading-none">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </CardHeader>
              <CardContent className="space-y-2 px-4">
                <Separator className="bg-border/60" />
                <dl className="space-y-1 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-medium">You get:</dt>
                    <dd className="text-muted-foreground">
                      {item.youGet.join(" · ")}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-medium">Best for:</dt>
                    <dd className="text-muted-foreground">{item.bestFor}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
