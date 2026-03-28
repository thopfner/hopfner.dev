import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import { AgentJobNotFoundError, AgentJobValidationError } from "./errors"
import {
  assertNoReviewedPlanApplyPayload,
  buildReviewedPlanApplyPayload,
} from "../execution/reviewed-apply"
import {
  assertAgentJobKind,
  isActiveAgentJobStatus,
  isSerializedAgentJobKind,
  normalizeAgentJobPayload,
  resolveAgentJobCancellationState,
  resolveAgentJobCancelTransition,
  type AgentJobCancellationState,
  type AgentJobCancelTransition,
} from "./lifecycle"
import type {
  AgentJobKind,
  AgentJobDetail,
  AgentJobListItem,
  AgentJobLogRow,
  AgentJobRow,
  AgentJobRunRow,
} from "./types"

type EnqueueAgentJobInput = {
  kind: string
  payload?: unknown
  requestedBy: string
  allowReviewedPlanApplyPayload?: boolean
}

type CreateReviewedPlanApplyJobInput = {
  sourceJobId: string
  requestedBy: string
}

type ListAgentJobsOptions = {
  limit?: number
}

type CancelAgentJobInput = {
  jobId: string
  requestedBy: string
}

type CancelAgentJobResult = {
  job: AgentJobRow
  transition: AgentJobCancelTransition
  cancellationState: AgentJobCancellationState
}

export type ActiveAgentJobConflict = {
  jobId: string
  kind: AgentJobKind
  status: AgentJobRow["status"]
  cancellationState: AgentJobCancellationState
}

const JOB_SELECT =
  "id, kind, status, requested_by, payload, result, worker_id, claimed_at, started_at, finished_at, cancel_requested_at, cancel_requested_by, canceled_at, canceled_by, failed_at, failure_code, failure_message, created_at, updated_at"

const RUN_SELECT =
  "id, job_id, run_number, status, worker_id, claimed_at, started_at, finished_at, heartbeat_at, canceled_at, failure_code, failure_message, created_at, updated_at"

const LOG_SELECT = "id, job_id, run_id, level, message, created_at"

function normalizeJobRow(row: AgentJobRow): AgentJobRow {
  return {
    ...row,
    payload:
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? row.payload
        : {},
    result:
      row.result && typeof row.result === "object" && !Array.isArray(row.result)
        ? row.result
        : {},
  }
}

export async function findActiveAgentJobConflict(
  supabase: SupabaseClient,
  kind: AgentJobKind
): Promise<ActiveAgentJobConflict | null> {
  if (!isSerializedAgentJobKind(kind)) {
    return null
  }

  const { data, error } = await supabase
    .from("agent_jobs")
    .select(JOB_SELECT)
    .eq("kind", kind)
    .in("status", ["queued", "claimed", "running"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<AgentJobRow>()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !isActiveAgentJobStatus(data.status)) {
    return null
  }

  const job = normalizeJobRow(data)
  return {
    jobId: job.id,
    kind: job.kind,
    status: job.status,
    cancellationState: resolveAgentJobCancellationState(job),
  }
}

export async function enqueueAgentJob(
  supabase: SupabaseClient,
  input: EnqueueAgentJobInput
): Promise<AgentJobRow> {
  const kind = assertAgentJobKind(input.kind)
  const payload = normalizeAgentJobPayload(input.payload)
  if (kind === "site_build_draft" && input.allowReviewedPlanApplyPayload !== true) {
    assertNoReviewedPlanApplyPayload(payload)
  }
  const activeConflict = await findActiveAgentJobConflict(supabase, kind)

  if (activeConflict) {
    throw new AgentJobValidationError(
      `A ${kind} job is already active on this deployment (${activeConflict.status}).`
    )
  }

  const { data, error } = await supabase.rpc("agent_enqueue_job", {
    p_kind: kind,
    p_payload: payload,
    p_requested_by: input.requestedBy,
  })

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to enqueue agent job.")
  }

  return normalizeJobRow(data as AgentJobRow)
}

export async function createReviewedPlanApplyJob(
  supabase: SupabaseClient,
  input: CreateReviewedPlanApplyJobInput
): Promise<AgentJobRow> {
  const sourceJobId = input.sourceJobId.trim()
  if (!sourceJobId) {
    throw new AgentJobValidationError("Source job id is required.")
  }

  const { data, error } = await supabase
    .from("agent_jobs")
    .select(JOB_SELECT)
    .eq("id", sourceJobId)
    .maybeSingle<AgentJobRow>()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new AgentJobNotFoundError("Agent job not found.")
  }

  const sourceJob = normalizeJobRow(data)
  return enqueueAgentJob(supabase, {
    kind: "site_build_draft",
    requestedBy: input.requestedBy,
    payload: buildReviewedPlanApplyPayload(sourceJob),
    allowReviewedPlanApplyPayload: true,
  })
}

export async function listAgentJobs(
  supabase: SupabaseClient,
  options: ListAgentJobsOptions = {}
): Promise<AgentJobListItem[]> {
  const limit = Math.min(Math.max(Math.trunc(options.limit ?? 50), 1), 200)

  const { data: jobsData, error: jobsError } = await supabase
    .from("agent_jobs")
    .select(JOB_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (jobsError) {
    throw new Error(jobsError.message)
  }

  const jobs = ((jobsData ?? []) as AgentJobRow[]).map(normalizeJobRow)
  const jobIds = jobs.map((job) => job.id)
  if (!jobIds.length) return []

  const { data: runsData, error: runsError } = await supabase
    .from("agent_job_runs")
    .select(RUN_SELECT)
    .in("job_id", jobIds)
    .order("run_number", { ascending: false })

  if (runsError) {
    throw new Error(runsError.message)
  }

  const latestRunByJobId = new Map<string, AgentJobRunRow>()
  for (const row of (runsData ?? []) as AgentJobRunRow[]) {
    if (!latestRunByJobId.has(row.job_id)) {
      latestRunByJobId.set(row.job_id, row)
    }
  }

  return jobs.map((job) => ({
    ...job,
    latestRun: latestRunByJobId.get(job.id) ?? null,
  }))
}

export async function getAgentJobDetail(
  supabase: SupabaseClient,
  jobId: string
): Promise<AgentJobDetail> {
  const id = jobId.trim()
  if (!id) {
    throw new AgentJobNotFoundError("Agent job not found.")
  }

  const { data: jobData, error: jobError } = await supabase
    .from("agent_jobs")
    .select(JOB_SELECT)
    .eq("id", id)
    .maybeSingle<AgentJobRow>()

  if (jobError) {
    throw new Error(jobError.message)
  }

  if (!jobData) {
    throw new AgentJobNotFoundError("Agent job not found.")
  }

  const [runsRes, logsRes] = await Promise.all([
    supabase
      .from("agent_job_runs")
      .select(RUN_SELECT)
      .eq("job_id", id)
      .order("run_number", { ascending: false }),
    supabase
      .from("agent_job_logs")
      .select(LOG_SELECT)
      .eq("job_id", id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }),
  ])

  if (runsRes.error) {
    throw new Error(runsRes.error.message)
  }

  if (logsRes.error) {
    throw new Error(logsRes.error.message)
  }

  return {
    job: normalizeJobRow(jobData),
    runs: (runsRes.data ?? []) as AgentJobRunRow[],
    logs: (logsRes.data ?? []) as AgentJobLogRow[],
  }
}

export async function cancelAgentJob(
  supabase: SupabaseClient,
  input: CancelAgentJobInput
): Promise<CancelAgentJobResult> {
  const job = (await getAgentJobDetail(supabase, input.jobId)).job
  const transition = resolveAgentJobCancelTransition(job)

  if (transition === "already_finished" || transition === "already_requested") {
    return {
      job,
      transition,
      cancellationState: resolveAgentJobCancellationState(job),
    }
  }

  const { data, error } = await supabase.rpc("agent_cancel_job", {
    p_job_id: job.id,
    p_actor: input.requestedBy,
  })

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to cancel agent job.")
  }

  const updatedJob = normalizeJobRow(data as AgentJobRow)

  return {
    job: updatedJob,
    transition,
    cancellationState: resolveAgentJobCancellationState(updatedJob),
  }
}
