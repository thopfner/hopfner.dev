"use client"

import {
  Divider,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import {
  asString,
  inputValueFromEvent,
} from "../payload"
import type { ContentEditorProps } from "../types"

const INTAKE_FIELD_KEYS = [
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

type IntakeFieldKey = (typeof INTAKE_FIELD_KEYS)[number]

const INTAKE_FIELD_DEFAULTS: Record<IntakeFieldKey, { label: string; helpText: string }> = {
  fullName: { label: "Full name", helpText: "" },
  workEmail: { label: "Work email", helpText: "" },
  company: { label: "Company", helpText: "" },
  jobTitle: { label: "Job title", helpText: "" },
  teamSize: { label: "Team size", helpText: "" },
  functionArea: { label: "Function area", helpText: "operations, finance, treasury, founder, other" },
  currentTools: { label: "Current tools", helpText: "" },
  mainBottleneck: { label: "Main bottleneck", helpText: "" },
  desiredOutcome90d: { label: "Desired outcome (90 days)", helpText: "" },
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

export function BookingSchedulerEditor({ content, onContentChange }: ContentEditorProps) {
  const intakeFields = asRecord(content.intakeFields)

  function setIntakeField(fieldKey: IntakeFieldKey, prop: "label" | "helpText", value: string) {
    onContentChange((c) => {
      const existing = asRecord(c.intakeFields)
      const field = asRecord(existing[fieldKey])
      return {
        ...c,
        intakeFields: {
          ...existing,
          [fieldKey]: {
            ...INTAKE_FIELD_DEFAULTS[fieldKey],
            ...field,
            [prop]: value,
          },
        },
      }
    })
  }

  return (
    <Stack gap="sm">
      <TextInput
        label="Cal.com event link"
        placeholder="e.g. hopfner/workflow-review"
        value={asString(content.calLink)}
        onChange={(e) => onContentChange((c) => ({ ...c, calLink: inputValueFromEvent(e) }))}
      />
      <TextInput
        label="Form heading"
        placeholder="e.g. Tell us about your workflow"
        value={asString(content.formHeading)}
        onChange={(e) => onContentChange((c) => ({ ...c, formHeading: inputValueFromEvent(e) }))}
      />
      <TextInput
        label="Submit button label"
        placeholder="Continue to scheduling"
        value={asString(content.submitLabel)}
        onChange={(e) => onContentChange((c) => ({ ...c, submitLabel: inputValueFromEvent(e) }))}
      />

      <Divider />
      <Text size="xs" c="dimmed" fw={500}>Intake form fields</Text>

      {INTAKE_FIELD_KEYS.map((key) => {
        const field = asRecord(intakeFields[key])
        const defaults = INTAKE_FIELD_DEFAULTS[key]
        return (
          <div key={key} className="space-y-1">
            <Text size="xs" fw={600} className="capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </Text>
            <TextInput
              label="Label"
              size="xs"
              value={asString(field.label, defaults.label)}
              onChange={(e) => setIntakeField(key, "label", inputValueFromEvent(e))}
            />
            <TextInput
              label="Help text"
              size="xs"
              value={asString(field.helpText, defaults.helpText)}
              onChange={(e) => setIntakeField(key, "helpText", inputValueFromEvent(e))}
            />
          </div>
        )
      })}
    </Stack>
  )
}
