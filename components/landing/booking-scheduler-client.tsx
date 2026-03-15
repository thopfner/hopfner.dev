"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { FadeIn } from "@/components/landing/motion-primitives"
import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { BookingIntakeForm } from "./booking-intake-form"
import { BookingCalEmbed } from "./booking-cal-embed"

type IntakeFieldConfig = {
  label: string
  helpText?: string
}

type Step = "form" | "calendar" | "success"

type Props = {
  calLink: string
  formHeading?: string
  submitLabel: string
  intakeFields: Record<string, IntakeFieldConfig>
}

export function BookingSchedulerClient({ calLink, formHeading, submitLabel, intakeFields }: Props) {
  const [step, setStep] = useState<Step>("form")
  const [attendee, setAttendee] = useState({ name: "", email: "" })
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (step !== "calendar") return
    const timer = setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
    return () => clearTimeout(timer)
  }, [step])

  const handleIntakeComplete = useCallback((intakeId: string, fullName: string, workEmail: string) => {
    setAttendee({ name: fullName, email: workEmail })
    setStep("calendar")
  }, [])

  const handleBookingComplete = useCallback(() => {
    setStep("success")
  }, [])

  if (step === "form") {
    return (
      <>
        {formHeading && (
          <FadeIn>
            <EditableTextSlot as="h3" fieldPath="content.formHeading" className="text-lg font-semibold mb-6 text-foreground">{formHeading}</EditableTextSlot>
          </FadeIn>
        )}
        <FadeIn>
          <BookingIntakeForm
            fields={intakeFields}
            submitLabel={submitLabel}
            onComplete={handleIntakeComplete}
          />
        </FadeIn>
      </>
    )
  }

  if (step === "calendar") {
    return (
      <FadeIn>
        <div ref={calendarRef} className="space-y-4">
          <div className="rounded-md bg-green-500/10 border border-green-500/20 px-4 py-3">
            <p className="text-sm text-green-400">
              Thanks, {attendee.name}! Now pick a time that works for you.
            </p>
          </div>
          <BookingCalEmbed
            calLink={calLink}
            name={attendee.name}
            email={attendee.email}
            onBookingComplete={handleBookingComplete}
          />
        </div>
      </FadeIn>
    )
  }

  return (
    <FadeIn>
      <div className="rounded-md border border-green-500/30 bg-green-500/10 px-6 py-8 text-center space-y-3">
        <div className="text-3xl">&#10003;</div>
        <h3 className="text-lg font-semibold text-foreground">
          You&rsquo;re all set, {attendee.name}!
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your call has been booked. Check <strong>{attendee.email}</strong> for a
          confirmation with calendar invite and meeting details.
        </p>
      </div>
    </FadeIn>
  )
}
