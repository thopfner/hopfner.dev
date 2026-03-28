import { existsSync } from "node:fs"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import {
  AGENT_JOB_RUN_STATUSES,
  AGENT_WORKER_LIVENESS_FILE_PATH,
  AGENT_WORKER_SYSTEMD_SERVICE_NAME,
} from "./constants"
import { DEFAULT_GEMINI_PLANNER_MODEL } from "../planning/planner-schema"
import {
  AgentJobTransitionError,
  AgentWorkerConfigError,
  AgentJobValidationError,
} from "./errors"
import { assertAgentJobKind } from "./lifecycle"
import type {
  AgentJobExecutionResult,
  AgentJobRecoveryAction,
  AgentJobRecoveryResult,
  AgentJobRow,
  AgentJobRunRow,
  AgentJobRunStatus,
  AgentJobStatus,
  AgentWorkerLivenessRecord,
  AgentWorkerLivenessStatus,
  AgentJobWorkerTransition,
} from "./types"

type ClaimNextAgentJobInput = {
  workerId: string
}

type StartAgentJobRunInput = {
  jobId: string
  runId: string
  workerId: string
}

type CompleteAgentJobRunInput = {
  jobId: string
  runId: string
  workerId: string
}

type FailAgentJobRunInput = {
  jobId: string
  runId: string
  workerId: string
  failureCode: string
  failureMessage?: string | null
}

type RecoverStaleAgentJobsInput = {
  workerId: string
  staleBefore: string
}

type UpdateAgentJobResultInput = {
  jobId: string
  result: Record<string, unknown>
  merge?: boolean
}

export type AgentWorkerProviderStatus = {
  imageGeneration: {
    provider: "gemini"
    configured: boolean
    model: string | null
    configError: string | null
  }
  planner: {
    provider: "gemini"
    configured: boolean
    model: string | null
    structuredOutput: true
    configError: string | null
  }
}

type WriteAgentWorkerLivenessInput = {
  workerId: string
  heartbeatAt?: string
  startedAt?: string
  pid?: number | null
  filePath?: string
  serviceName?: string
}

type ReadAgentWorkerLivenessStatusOptions = {
  now?: () => number
  staleAfterMs?: number | null
  filePath?: string
  serviceName?: string
  serviceUnitPath?: string
}

export type AgentWorkerService = {
  getSupabaseClient(): SupabaseClient
  claimNextJob(input: ClaimNextAgentJobInput): Promise<AgentJobExecutionResult | null>
  startJobRun(input: StartAgentJobRunInput): Promise<AgentJobExecutionResult>
  completeJobRun(input: CompleteAgentJobRunInput): Promise<AgentJobExecutionResult>
  failJobRun(input: FailAgentJobRunInput): Promise<AgentJobExecutionResult>
  recoverStaleJobs(input: RecoverStaleAgentJobsInput): Promise<AgentJobRecoveryResult[]>
  updateJobResult(input: UpdateAgentJobResultInput): Promise<AgentJobRow>
}

type JsonRecord = Record<string, unknown>

const AGENT_JOB_STATUSES = [
  "queued",
  "claimed",
  "running",
  "completed",
  "failed",
  "canceled",
] as const satisfies readonly AgentJobStatus[]

const AGENT_JOB_WORKER_TRANSITIONS = [
  "claimed",
  "running",
  "completed",
  "failed",
  "canceled",
] as const satisfies readonly AgentJobWorkerTransition[]

const AGENT_JOB_RECOVERY_ACTIONS = [
  "requeued",
  "canceled",
] as const satisfies readonly AgentJobRecoveryAction[]

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown, message: string): JsonRecord {
  if (!isRecord(value)) {
    throw new AgentJobTransitionError(message)
  }
  return value
}

function asString(value: unknown, message: string): string {
  if (typeof value !== "string") {
    throw new AgentJobTransitionError(message)
  }
  return value
}

function asNullableString(value: unknown, message: string): string | null {
  if (value === null || value === undefined) return null
  return asString(value, message)
}

function asPayloadRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {}
  return value
}

function asAgentJobStatus(value: unknown): AgentJobStatus {
  const status = asString(value, "Invalid agent job status.")
  if (!(AGENT_JOB_STATUSES as readonly string[]).includes(status)) {
    throw new AgentJobTransitionError(`Unsupported agent job status: ${status}`)
  }
  return status as AgentJobStatus
}

function asAgentJobRunStatus(value: unknown): AgentJobRunStatus {
  const status = asString(value, "Invalid agent job run status.")
  if (!(AGENT_JOB_RUN_STATUSES as readonly string[]).includes(status)) {
    throw new AgentJobTransitionError(`Unsupported agent job run status: ${status}`)
  }
  return status as AgentJobRunStatus
}

function asWorkerTransition(value: unknown): AgentJobWorkerTransition {
  const transition = asString(value, "Invalid agent job transition.")
  if (!(AGENT_JOB_WORKER_TRANSITIONS as readonly string[]).includes(transition)) {
    throw new AgentJobTransitionError(`Unsupported agent job transition: ${transition}`)
  }
  return transition as AgentJobWorkerTransition
}

function asRecoveryAction(value: unknown): AgentJobRecoveryAction {
  const action = asString(value, "Invalid agent job recovery action.")
  if (!(AGENT_JOB_RECOVERY_ACTIONS as readonly string[]).includes(action)) {
    throw new AgentJobTransitionError(`Unsupported agent job recovery action: ${action}`)
  }
  return action as AgentJobRecoveryAction
}

function normalizeJobRow(value: unknown): AgentJobRow {
  const row = asRecord(value, "Invalid agent job row.")

  return {
    id: asString(row.id, "Invalid agent job id."),
    kind: assertAgentJobKind(asString(row.kind, "Invalid agent job kind.")),
    status: asAgentJobStatus(row.status),
    requested_by: asString(row.requested_by, "Invalid agent job requester."),
    payload: asPayloadRecord(row.payload),
    result: asPayloadRecord(row.result),
    worker_id: asNullableString(row.worker_id, "Invalid agent job worker id."),
    claimed_at: asNullableString(row.claimed_at, "Invalid agent job claimed_at."),
    started_at: asNullableString(row.started_at, "Invalid agent job started_at."),
    finished_at: asNullableString(row.finished_at, "Invalid agent job finished_at."),
    cancel_requested_at: asNullableString(
      row.cancel_requested_at,
      "Invalid agent job cancel_requested_at."
    ),
    cancel_requested_by: asNullableString(
      row.cancel_requested_by,
      "Invalid agent job cancel_requested_by."
    ),
    canceled_at: asNullableString(row.canceled_at, "Invalid agent job canceled_at."),
    canceled_by: asNullableString(row.canceled_by, "Invalid agent job canceled_by."),
    failed_at: asNullableString(row.failed_at, "Invalid agent job failed_at."),
    failure_code: asNullableString(row.failure_code, "Invalid agent job failure_code."),
    failure_message: asNullableString(
      row.failure_message,
      "Invalid agent job failure_message."
    ),
    created_at: asString(row.created_at, "Invalid agent job created_at."),
    updated_at: asString(row.updated_at, "Invalid agent job updated_at."),
  }
}

function normalizeRunRow(value: unknown): AgentJobRunRow {
  const row = asRecord(value, "Invalid agent job run row.")
  const runNumber = Number(row.run_number ?? 0)
  if (!Number.isInteger(runNumber) || runNumber <= 0) {
    throw new AgentJobTransitionError("Invalid agent job run number.")
  }

  return {
    id: asString(row.id, "Invalid agent job run id."),
    job_id: asString(row.job_id, "Invalid agent job run job_id."),
    run_number: runNumber,
    status: asAgentJobRunStatus(row.status),
    worker_id: asNullableString(row.worker_id, "Invalid agent job run worker_id."),
    claimed_at: asNullableString(row.claimed_at, "Invalid agent job run claimed_at."),
    started_at: asNullableString(row.started_at, "Invalid agent job run started_at."),
    finished_at: asNullableString(row.finished_at, "Invalid agent job run finished_at."),
    heartbeat_at: asNullableString(row.heartbeat_at, "Invalid agent job run heartbeat_at."),
    canceled_at: asNullableString(row.canceled_at, "Invalid agent job run canceled_at."),
    failure_code: asNullableString(
      row.failure_code,
      "Invalid agent job run failure_code."
    ),
    failure_message: asNullableString(
      row.failure_message,
      "Invalid agent job run failure_message."
    ),
    created_at: asString(row.created_at, "Invalid agent job run created_at."),
    updated_at: asString(row.updated_at, "Invalid agent job run updated_at."),
  }
}

function normalizeExecutionResult(value: unknown): AgentJobExecutionResult {
  const row = asRecord(value, "Invalid agent job execution result.")

  return {
    transition: asWorkerTransition(row.transition),
    job: normalizeJobRow(row.job),
    run: normalizeRunRow(row.run),
  }
}

function normalizeRecoveryResult(value: unknown): AgentJobRecoveryResult {
  const row = asRecord(value, "Invalid agent job recovery result.")

  return {
    action: asRecoveryAction(row.action),
    job: normalizeJobRow(row.job),
    run: normalizeRunRow(row.run),
  }
}

function getWorkerServiceErrorMessage(
  fallback: string,
  error: { message?: string } | null,
  value?: string | null
): string {
  const message = error?.message ?? value
  return message ? `${fallback} ${message}` : fallback
}

function assertWorkerId(workerId: string): string {
  const normalized = workerId.trim()
  if (!normalized) {
    throw new AgentJobValidationError("Worker id is required.")
  }
  return normalized
}

function assertFailureCode(failureCode: string): string {
  const normalized = failureCode.trim()
  if (!normalized) {
    throw new AgentJobValidationError("Failure code is required.")
  }
  return normalized
}

function normalizeRecoveries(data: unknown): AgentJobRecoveryResult[] {
  if (!data) return []
  if (!Array.isArray(data)) {
    throw new AgentJobTransitionError("Invalid stale-agent-job recovery response.")
  }
  return data.map((entry) => normalizeRecoveryResult(entry))
}

function isAgentWorkerLivenessRecord(value: unknown): value is AgentWorkerLivenessRecord {
  if (!isRecord(value)) return false
  return (
    typeof value.serviceName === "string" &&
    typeof value.workerId === "string" &&
    typeof value.heartbeatAt === "string" &&
    typeof value.startedAt === "string" &&
    (typeof value.pid === "number" || value.pid === null)
  )
}

async function readAgentWorkerLivenessRecord(filePath: string): Promise<AgentWorkerLivenessRecord | null> {
  try {
    const raw = await readFile(filePath, "utf8")
    const parsed = JSON.parse(raw) as unknown
    return isAgentWorkerLivenessRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

export async function writeAgentWorkerLiveness(
  input: WriteAgentWorkerLivenessInput
): Promise<AgentWorkerLivenessRecord> {
  const workerId = assertWorkerId(input.workerId)
  const heartbeatAt = input.heartbeatAt ?? new Date().toISOString()
  const filePath = input.filePath ?? AGENT_WORKER_LIVENESS_FILE_PATH
  const serviceName = input.serviceName ?? AGENT_WORKER_SYSTEMD_SERVICE_NAME
  const pid = input.pid ?? process.pid
  const existing = input.startedAt ? null : await readAgentWorkerLivenessRecord(filePath)
  const startedAt = input.startedAt ?? existing?.startedAt ?? heartbeatAt

  const record: AgentWorkerLivenessRecord = {
    serviceName,
    workerId,
    heartbeatAt,
    startedAt,
    pid,
  }

  await mkdir(dirname(filePath), { recursive: true })
  const tempPath = `${filePath}.tmp`
  await writeFile(tempPath, JSON.stringify(record, null, 2), "utf8")
  await rename(tempPath, filePath)
  return record
}

export async function readAgentWorkerLivenessStatus(
  options: ReadAgentWorkerLivenessStatusOptions = {}
): Promise<AgentWorkerLivenessStatus> {
  const serviceName = options.serviceName ?? AGENT_WORKER_SYSTEMD_SERVICE_NAME
  const filePath = options.filePath ?? AGENT_WORKER_LIVENESS_FILE_PATH
  const serviceUnitPath =
    options.serviceUnitPath ?? `/etc/systemd/system/${serviceName}`
  const serviceInstalled = existsSync(serviceUnitPath)

  let record: AgentWorkerLivenessRecord | null = null
  record = await readAgentWorkerLivenessRecord(filePath)

  if (!record) {
    return {
      serviceName,
      serviceInstalled,
      online: false,
      stale: false,
      lastHeartbeatAt: null,
      workerId: null,
      startedAt: null,
    }
  }

  const heartbeatMs = Date.parse(record.heartbeatAt)
  const isValidHeartbeat = Number.isFinite(heartbeatMs)
  const staleAfterMs = options.staleAfterMs ?? null
  const nowMs = options.now?.() ?? Date.now()
  const stale =
    isValidHeartbeat && staleAfterMs !== null
      ? nowMs - heartbeatMs > staleAfterMs
      : false

  return {
    serviceName: record.serviceName || serviceName,
    serviceInstalled,
    online: isValidHeartbeat && !stale,
    stale,
    lastHeartbeatAt: isValidHeartbeat ? record.heartbeatAt : null,
    workerId: record.workerId || null,
    startedAt: record.startedAt || null,
  }
}

export function createAgentWorkerSupabaseClient(
  env: NodeJS.ProcessEnv = process.env
): SupabaseClient {
  const url = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new AgentWorkerConfigError(
      "Missing Supabase env vars: SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)."
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export function readAgentWorkerProviderStatus(
  env: NodeJS.ProcessEnv = process.env
): AgentWorkerProviderStatus {
  const apiKey = env.GEMINI_API_KEY?.trim() ?? ""
  const model = env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.5-flash-image-preview"
  const plannerConfigured = Boolean(apiKey)
  const plannerModel = env.GEMINI_PLANNER_MODEL?.trim() || DEFAULT_GEMINI_PLANNER_MODEL

  return {
    imageGeneration: {
      provider: "gemini",
      configured: Boolean(apiKey),
      model: apiKey ? model : null,
      configError: apiKey
        ? null
        : "Generated background images are unavailable until GEMINI_API_KEY is configured.",
    },
    planner: {
      provider: "gemini",
      configured: plannerConfigured,
      model: plannerConfigured ? plannerModel : null,
      structuredOutput: true,
      configError: plannerConfigured
        ? null
        : "Natural-language planning is unavailable until GEMINI_API_KEY is configured.",
    },
  }
}

export async function claimNextAgentJob(
  supabase: SupabaseClient,
  input: ClaimNextAgentJobInput
): Promise<AgentJobExecutionResult | null> {
  const { data, error } = await supabase.rpc("agent_claim_next_job", {
    p_worker_id: assertWorkerId(input.workerId),
  })

  if (error) {
    throw new AgentJobTransitionError(
      getWorkerServiceErrorMessage("Failed to claim next agent job.", error)
    )
  }

  if (!data) return null
  return normalizeExecutionResult(data)
}

export async function startAgentJobRun(
  supabase: SupabaseClient,
  input: StartAgentJobRunInput
): Promise<AgentJobExecutionResult> {
  const { data, error } = await supabase.rpc("agent_start_job_run", {
    p_job_id: input.jobId,
    p_run_id: input.runId,
    p_worker_id: assertWorkerId(input.workerId),
  })

  if (error || !data) {
    throw new AgentJobTransitionError(
      getWorkerServiceErrorMessage("Failed to start agent job run.", error)
    )
  }

  return normalizeExecutionResult(data)
}

export async function completeAgentJobRun(
  supabase: SupabaseClient,
  input: CompleteAgentJobRunInput
): Promise<AgentJobExecutionResult> {
  const { data, error } = await supabase.rpc("agent_complete_job_run", {
    p_job_id: input.jobId,
    p_run_id: input.runId,
    p_worker_id: assertWorkerId(input.workerId),
  })

  if (error || !data) {
    throw new AgentJobTransitionError(
      getWorkerServiceErrorMessage("Failed to complete agent job run.", error)
    )
  }

  return normalizeExecutionResult(data)
}

export async function failAgentJobRun(
  supabase: SupabaseClient,
  input: FailAgentJobRunInput
): Promise<AgentJobExecutionResult> {
  const { data, error } = await supabase.rpc("agent_fail_job_run", {
    p_job_id: input.jobId,
    p_run_id: input.runId,
    p_worker_id: assertWorkerId(input.workerId),
    p_failure_code: assertFailureCode(input.failureCode),
    p_failure_message: input.failureMessage ?? null,
  })

  if (error || !data) {
    throw new AgentJobTransitionError(
      getWorkerServiceErrorMessage("Failed to fail agent job run.", error)
    )
  }

  return normalizeExecutionResult(data)
}

export async function recoverStaleAgentJobs(
  supabase: SupabaseClient,
  input: RecoverStaleAgentJobsInput
): Promise<AgentJobRecoveryResult[]> {
  const { data, error } = await supabase.rpc("agent_recover_stale_jobs", {
    p_worker_id: assertWorkerId(input.workerId),
    p_stale_before: input.staleBefore,
  })

  if (error) {
    throw new AgentJobTransitionError(
      getWorkerServiceErrorMessage("Failed to recover stale agent jobs.", error)
    )
  }

  return normalizeRecoveries(data)
}

export async function updateAgentJobResult(
  supabase: SupabaseClient,
  input: UpdateAgentJobResultInput
): Promise<AgentJobRow> {
  const { data, error } = await supabase.rpc("agent_update_job_result", {
    p_job_id: input.jobId,
    p_result: input.result,
    p_merge: input.merge ?? true,
  })

  if (error || !data) {
    throw new AgentJobTransitionError(
      getWorkerServiceErrorMessage("Failed to update agent job result.", error)
    )
  }

  return normalizeJobRow(data)
}

export function createAgentWorkerService(supabase: SupabaseClient): AgentWorkerService {
  return {
    getSupabaseClient: () => supabase,
    claimNextJob: (input) => claimNextAgentJob(supabase, input),
    startJobRun: (input) => startAgentJobRun(supabase, input),
    completeJobRun: (input) => completeAgentJobRun(supabase, input),
    failJobRun: (input) => failAgentJobRun(supabase, input),
    recoverStaleJobs: (input) => recoverStaleAgentJobs(supabase, input),
    updateJobResult: (input) => updateAgentJobResult(supabase, input),
  }
}
