import type { CSSProperties } from "react"

import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { FadeIn } from "@/components/landing/motion-primitives"
import { SectionShell } from "@/components/landing/section-primitives"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { HEADING_TREATMENT_CLASSES, SUBTITLE_SIZE_CLASSES } from "@/lib/design-system/presentation"
import { cn } from "@/lib/utils"
import { BookingSchedulerClient } from "./booking-scheduler-client"

type IntakeFieldConfig = {
  label: string
  helpText?: string
}

type IntakeFieldsMap = Record<string, IntakeFieldConfig>

export function BookingSchedulerSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  calLink,
  formHeading,
  submitLabel,
  intakeFields,
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
  ctaLabel?: string
  ctaHref?: string
  calLink?: string
  formHeading?: string
  submitLabel?: string
  intakeFields?: IntakeFieldsMap
  ui?: ResolvedSectionUi
}) {
  const headingCls = HEADING_TREATMENT_CLASSES[ui?.headingTreatment ?? "default"]
  const subtitleCls = SUBTITLE_SIZE_CLASSES[ui?.subtitleSize ?? "md"]
  const headingId = sectionId ? `${sectionId}-heading` : "booking-scheduler-heading"

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
      <div className="max-w-2xl mx-auto" style={panelStyle}>
        <FadeIn>
          <div className="mb-8">
            {title && (
              <EditableTextSlot
                as="h2"
                id={headingId}
                fieldPath="meta.title"
                className={cn("text-heading text-balance text-2xl sm:text-3xl", headingCls)}
              >
                {title}
              </EditableTextSlot>
            )}
            {subtitle && (
              <EditableTextSlot as="p" fieldPath="meta.subtitle" className={cn("mt-2 text-muted-foreground text-balance", subtitleCls)} multiline>
                {subtitle}
              </EditableTextSlot>
            )}
          </div>
        </FadeIn>

        <BookingSchedulerClient
          calLink={calLink || process.env.NEXT_PUBLIC_CAL_LINK || ""}
          formHeading={formHeading}
          submitLabel={ctaLabel || submitLabel || "Continue to scheduling"}
          intakeFields={intakeFields ?? {}}
        />
      </div>
    </SectionShell>
  )
}
