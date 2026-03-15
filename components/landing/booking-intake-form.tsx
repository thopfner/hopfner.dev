"use client"

import { useState, useCallback } from "react"
import { EditableTextSlot } from "@/components/landing/editable-text-slot"
import { INTAKE_FIELD_KEYS, FUNCTION_AREA_OPTIONS, type IntakeFieldKey, type IntakeFormData } from "@/lib/booking/types"

type IntakeFieldConfig = {
  label: string
  helpText?: string
}

type Props = {
  fields: Record<string, IntakeFieldConfig>
  submitLabel?: string
  onComplete: (intakeId: string, fullName: string, workEmail: string) => void
}

const REQUIRED_FIELDS: IntakeFieldKey[] = ["fullName", "workEmail", "company", "teamSize", "mainBottleneck"]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function BookingIntakeForm({ fields, submitLabel = "Continue to scheduling", onComplete }: Props) {
  const [formData, setFormData] = useState<IntakeFormData>({
    fullName: "",
    workEmail: "",
    company: "",
    jobTitle: "",
    teamSize: "",
    functionArea: "",
    currentTools: "",
    mainBottleneck: "",
    desiredOutcome90d: "",
  })
  const [honeypot, setHoneypot] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<IntakeFieldKey, string>>>({})
  const [globalError, setGlobalError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleChange = useCallback((key: IntakeFieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const validate = useCallback((): boolean => {
    const errors: Partial<Record<IntakeFieldKey, string>> = {}

    for (const key of REQUIRED_FIELDS) {
      if (!formData[key]?.trim()) {
        const label = fields[key]?.label || key
        errors[key] = `${label} is required`
      }
    }

    if (formData.workEmail?.trim() && !EMAIL_RE.test(formData.workEmail.trim())) {
      errors.workEmail = "Please enter a valid email address"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, fields])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError("")

    if (!validate()) return

    setSubmitting(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const res = await fetch("/api/booking/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          website: honeypot, // honeypot
          utmSource: params.get("utm_source") || undefined,
          utmMedium: params.get("utm_medium") || undefined,
          utmCampaign: params.get("utm_campaign") || undefined,
          referrer: document.referrer || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (res.status === 422 && json.errors) {
          const errMap: Partial<Record<IntakeFieldKey, string>> = {}
          for (const err of json.errors) {
            errMap[err.field as IntakeFieldKey] = err.message
          }
          setFieldErrors(errMap)
        } else {
          setGlobalError(json.error || "Something went wrong. Please try again.")
        }
        return
      }

      onComplete(json.intakeId, formData.fullName, formData.workEmail)
    } catch {
      setGlobalError("Network error. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }, [formData, honeypot, validate, onComplete])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {INTAKE_FIELD_KEYS.map((key) => {
        const cfg = fields[key] ?? { label: key }
        const error = fieldErrors[key]
        const isRequired = REQUIRED_FIELDS.includes(key)

        if (key === "functionArea") {
          return (
            <div key={key}>
              <label htmlFor={`intake-${key}`} className="block text-sm font-medium text-foreground mb-1">
                <EditableTextSlot as="span" fieldPath={`content.intakeFields.${key}.label`}>{cfg.label}</EditableTextSlot>{isRequired && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <select
                id={`intake-${key}`}
                value={formData[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select...</option>
                {FUNCTION_AREA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
              {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            </div>
          )
        }

        if (key === "mainBottleneck" || key === "desiredOutcome90d") {
          return (
            <div key={key}>
              <label htmlFor={`intake-${key}`} className="block text-sm font-medium text-foreground mb-1">
                <EditableTextSlot as="span" fieldPath={`content.intakeFields.${key}.label`}>{cfg.label}</EditableTextSlot>{isRequired && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <textarea
                id={`intake-${key}`}
                rows={3}
                placeholder={cfg.helpText || ""}
                value={formData[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            </div>
          )
        }

        return (
          <div key={key}>
            <label htmlFor={`intake-${key}`} className="block text-sm font-medium text-foreground mb-1">
              <EditableTextSlot as="span" fieldPath={`content.intakeFields.${key}.label`}>{cfg.label}</EditableTextSlot>{isRequired && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            <input
              id={`intake-${key}`}
              type={key === "workEmail" ? "email" : "text"}
              placeholder={cfg.helpText || ""}
              value={formData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>
        )
      })}

      {globalError && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-md px-3 py-2">{globalError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  )
}
