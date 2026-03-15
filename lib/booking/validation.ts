import type { IntakeSubmission } from "./types"

export type ValidationError = {
  field: string
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateIntakeSubmission(data: IntakeSubmission): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.fullName?.trim()) {
    errors.push({ field: "fullName", message: "Full name is required" })
  }

  if (!data.workEmail?.trim()) {
    errors.push({ field: "workEmail", message: "Work email is required" })
  } else if (!EMAIL_RE.test(data.workEmail.trim())) {
    errors.push({ field: "workEmail", message: "Please enter a valid email address" })
  }

  if (!data.company?.trim()) {
    errors.push({ field: "company", message: "Company is required" })
  }

  if (!data.teamSize?.trim()) {
    errors.push({ field: "teamSize", message: "Team size is required" })
  }

  if (!data.mainBottleneck?.trim()) {
    errors.push({ field: "mainBottleneck", message: "Main bottleneck is required" })
  }

  return errors
}

/** Returns true if the honeypot field was filled (bot detected). */
export function isHoneypotFilled(data: IntakeSubmission): boolean {
  return Boolean(data.website?.trim())
}
