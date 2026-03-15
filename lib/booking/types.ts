export const INTAKE_FIELD_KEYS = [
  "fullName",
  "workEmail",
  "company",
  "jobTitle",
  "teamSize",
  "functionArea",
  "currentTools",
  "mainBottleneck",
  "desiredOutcome90d",
] as const

export type IntakeFieldKey = (typeof INTAKE_FIELD_KEYS)[number]

export type IntakeFormData = Record<IntakeFieldKey, string>

export type IntakeSubmission = IntakeFormData & {
  /** Honeypot — must be empty */
  website?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
}

export const FUNCTION_AREA_OPTIONS = [
  "operations",
  "finance",
  "treasury",
  "founder",
  "other",
] as const

export type FunctionArea = (typeof FUNCTION_AREA_OPTIONS)[number]
