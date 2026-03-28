"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material"

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPanel,
  WorkspaceHeader,
  WorkspacePanel,
} from "@/components/admin/ui"

type AgentStatusResponse = {
  status: {
    runtime: string
    supportedJobKinds: string[]
    rollbackSupported: boolean
    worker: {
      configured: boolean
      serviceName: string
      serviceInstalled: boolean
      online: boolean
      stale: boolean
      lastHeartbeatAt: string | null
      workerId: string | null
      startedAt: string | null
      pollIntervalMs: number | null
      staleAfterMs: number | null
      configError: string | null
    }
    providers?: {
      imageGeneration?: {
        provider: string
        configured: boolean
        model: string | null
        configError: string | null
      }
      planner?: {
        provider: string
        configured: boolean
        model: string | null
        structuredOutput: boolean
        configError: string | null
      }
    }
    controls?: {
      draftExecution?: {
        mode: string
        enqueueBlocked: boolean
        enqueueReason?: string | null
        activeJobId: string | null
        activeJobStatus: string | null
        cancellationState: string | null
      }
    }
    retryPolicy?: {
      staleRecovery: string
      draftApplyProtection: string
    }
    v1Scope?: {
      autoPublish: boolean
      customSectionSchemaCreation: boolean
      publicWorkerIngress: boolean
      publishRequiresHumanReview: boolean
    }
    latestActivity: {
      jobId: string
      kind: string
      status: string
      cancellationState?: string | null
      createdAt: string
      updatedAt: string
      latestRun: {
        runNumber: number
        status: string
        claimedAt: string | null
        startedAt: string | null
        finishedAt: string | null
        heartbeatAt: string | null
      } | null
    } | null
  }
  error?: string
}

type AgentJobRun = {
  id: string
  job_id: string
  run_number: number
  status: string
  worker_id: string | null
  claimed_at: string | null
  started_at: string | null
  finished_at: string | null
  heartbeat_at: string | null
  canceled_at: string | null
  failure_code: string | null
  failure_message: string | null
  created_at: string
  updated_at: string
}

type AgentJobLog = {
  id: number
  job_id: string
  run_id: string | null
  level: "info" | "warn" | "error"
  message: string
  created_at: string
}

type AgentJob = {
  id: string
  kind: string
  status: string
  requested_by: string
  payload: Record<string, unknown>
  result: Record<string, unknown>
  worker_id: string | null
  claimed_at: string | null
  started_at: string | null
  finished_at: string | null
  cancel_requested_at: string | null
  cancel_requested_by: string | null
  canceled_at: string | null
  canceled_by: string | null
  failed_at: string | null
  failure_code: string | null
  failure_message: string | null
  created_at: string
  updated_at: string
}

type AgentJobListItem = AgentJob & {
  latestRun: AgentJobRun | null
}

type AgentJobListResponse = {
  jobs: AgentJobListItem[]
  error?: string
}

type AgentJobDetailResponse = {
  job: AgentJob
  runs: AgentJobRun[]
  logs: AgentJobLog[]
  error?: string
}

type PagesOverviewResponse = {
  pages: Array<{
    id: string
    slug: string
    title: string
  }>
  error?: string
}

type Phase3PlanSummary = {
  pageCount?: number
  sectionCount?: number
  themeChangeCount?: number
  themePresetId?: string | null
  hasThemeSettings?: boolean
  touchedPageSlugs?: string[]
  sectionsByPage?: Array<{
    slug: string
    title: string
    sectionCount: number
    sectionTypes: string[]
  }>
}

type Phase3Planner = {
  inputMode?: "json" | "natural-language"
  provider?: string | null
  model?: string | null
  assumptions?: string[]
  warnings?: string[]
  downgradedRequests?: string[]
}

type Phase3Result = {
  mode?: "plan-only" | "apply"
  applyRequested?: boolean
  applyState?: "not_applied" | "applying" | "applied"
  reviewedSourceJobId?: string | null
  rollbackSnapshotId?: string | null
  touchedPageSlugs?: string[]
  planSummary?: Phase3PlanSummary
  planner?: Phase3Planner
  plan?: {
    pages?: Array<{
      sections?: Array<{
        media?: {
          backgroundImage?: {
            prompt?: string | null
          } | null
        } | null
      }>
    }>
  }
}

const POLL_INTERVAL_MS = 5_000
const AGENT_DRAFT_PROMPT_MAX_CHARS = 12_000
const AGENT_DRAFT_MAX_PAGES = 5
const AGENT_DRAFT_MAX_SECTIONS = 24
const AGENT_DRAFT_MAX_GENERATED_IMAGES = 6
const DEFAULT_PROMPT = [
  "Build a one-page marketing site for a workflow automation consultancy.",
  "Use a strong hero, service cards, a process section, social proof, FAQ, and a final CTA.",
  "Keep the tone practical and senior-level, and prepare draft-only changes for review.",
].join("\n")

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not available"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function readPhase3Result(result: Record<string, unknown>): Phase3Result | null {
  const phase3 = result.phase3
  if (!phase3 || typeof phase3 !== "object" || Array.isArray(phase3)) return null
  return phase3 as Phase3Result
}

function isCancelEligible(job: AgentJob | AgentJobListItem) {
  return (
    ["queued", "claimed", "running"].includes(job.status) &&
    !job.cancel_requested_at
  )
}

function isRollbackEligible(job: AgentJob | AgentJobListItem, phase3: Phase3Result | null) {
  return (
    job.status === "completed" &&
    phase3?.mode === "apply" &&
    phase3.applyState === "applied" &&
    Boolean(phase3.rollbackSnapshotId)
  )
}

function isReviewedApplyEligible(
  job: AgentJob | AgentJobListItem,
  phase3: Phase3Result | null,
  enqueueBlocked: boolean
) {
  return (
    job.status === "completed" &&
    phase3?.mode === "plan-only" &&
    phase3.applyState === "not_applied" &&
    !enqueueBlocked
  )
}

function tryExtractPromptJsonOnClient(prompt: string): Record<string, unknown> | null {
  const trimmed = prompt.trim()
  if (!trimmed) return null

  const fencedMatch =
    trimmed.match(/```json\s*([\s\S]*?)```/i) ??
    trimmed.match(/```\s*([\s\S]*?)```/i)
  const rawJson =
    fencedMatch?.[1] ??
    (trimmed.startsWith("{") && trimmed.endsWith("}") ? trimmed : null) ??
    (() => {
      const start = trimmed.indexOf("{")
      const end = trimmed.lastIndexOf("}")
      return start >= 0 && end > start ? trimmed.slice(start, end + 1) : null
    })()

  if (!rawJson) return null

  try {
    const parsed = JSON.parse(rawJson) as unknown
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function detectPromptModeOnClient(prompt: string): "json" | "natural-language" {
  return tryExtractPromptJsonOnClient(prompt) ? "json" : "natural-language"
}

function countGeneratedBackgroundImages(result: Phase3Result | null): number {
  const pages = result?.plan?.pages ?? []
  return pages.reduce(
    (count, page) =>
      count +
      (page.sections ?? []).filter((section) => Boolean(section.media?.backgroundImage?.prompt))
        .length,
    0
  )
}

function formatDraftExecutionReason(status: AgentStatusResponse["status"] | null): string | null {
  return status?.controls?.draftExecution?.enqueueReason ?? null
}

function formatConflictMessage(input: {
  error?: string
  conflict?: {
    jobId?: string | null
    status?: string | null
    cancellationState?: string | null
  }
}): string {
  if (!input.conflict?.jobId) {
    return input.error ?? "A draft job is already active on this deployment."
  }

  return `${input.error ?? "A draft job is already active on this deployment."} Active draft job: ${input.conflict.jobId} (${input.conflict.status ?? "unknown"}, ${input.conflict.cancellationState ?? "unknown"}).`
}

function describeFailure(result: Phase3Result | null, job: AgentJob | AgentJobListItem): string | null {
  if (!job.failure_code && !job.failure_message) return null

  const detail = job.failure_message ?? "Job failed."
  switch (job.failure_code) {
    case "validation_error":
      return `Plan validation failed before draft changes were applied. ${detail}`
    case "plan_refused":
      return `The request was refused because it exceeds v1 scope. No draft changes were applied. ${detail}`
    case "provider_unavailable":
      return result?.mode === "apply"
        ? `A required provider was unavailable, so the draft apply did not complete. ${detail}`
        : `A required provider was unavailable, so the plan could not be generated. ${detail}`
    case "provider_error":
      return result?.mode === "apply"
        ? `A provider request failed, so the draft apply did not complete. ${detail}`
        : `A provider request failed while generating the plan. ${detail}`
    default:
      return `${job.failure_code ? `${job.failure_code}: ` : ""}${detail}`
  }
}

function formatInputMode(value: Phase3Planner["inputMode"]) {
  return value === "natural-language" ? "Natural language" : value === "json" ? "JSON" : "Unknown"
}

export function AgentWorkspace() {
  const [status, setStatus] = useState<AgentStatusResponse["status"] | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [creating, setCreating] = useState<"plan-only" | "apply" | null>(null)

  const [jobs, setJobs] = useState<AgentJobListItem[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [jobsLoadedOnce, setJobsLoadedOnce] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const [detail, setDetail] = useState<AgentJobDetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [acting, setActing] = useState<"cancel" | "rollback" | "apply-reviewed" | null>(null)

  const [pageIdBySlug, setPageIdBySlug] = useState<Record<string, string>>({})

  const statusInFlightRef = useRef(false)
  const jobsInFlightRef = useRef(false)
  const pagesInFlightRef = useRef(false)
  const detailRequestIdRef = useRef(0)

  const loadStatus = useCallback(async () => {
    if (statusInFlightRef.current) return
    statusInFlightRef.current = true
    setStatusLoading((prev) => (status ? prev : true))
    try {
      const response = await fetch("/admin/api/agent/status")
      const json = (await response.json()) as AgentStatusResponse
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to load agent status.")
      }
      setStatus(json.status)
      setStatusError(null)
    } catch (error) {
      setStatusError(toErrorMessage(error, "Failed to load agent status."))
    } finally {
      statusInFlightRef.current = false
      setStatusLoading(false)
    }
  }, [status])

  const loadPages = useCallback(async () => {
    if (pagesInFlightRef.current) return
    pagesInFlightRef.current = true
    try {
      const response = await fetch("/admin/api/pages/overview")
      const json = (await response.json()) as PagesOverviewResponse
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to load pages overview.")
      }

      const mapping = Object.fromEntries(json.pages.map((page) => [page.slug, page.id]))
      setPageIdBySlug(mapping)
    } catch {
      setPageIdBySlug({})
    } finally {
      pagesInFlightRef.current = false
    }
  }, [])

  const loadJobs = useCallback(async () => {
    if (jobsInFlightRef.current) return
    jobsInFlightRef.current = true
    setJobsLoading(!jobsLoadedOnce)
    try {
      const response = await fetch("/admin/api/agent/jobs?limit=50")
      const json = (await response.json()) as AgentJobListResponse
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to load jobs.")
      }

      setJobs(json.jobs)
      setJobsError(null)
      setJobsLoadedOnce(true)
      setSelectedJobId((current) => {
        if (current && json.jobs.some((job) => job.id === current)) return current
        return json.jobs[0]?.id ?? null
      })
    } catch (error) {
      setJobsError(toErrorMessage(error, "Failed to load jobs."))
    } finally {
      jobsInFlightRef.current = false
      if (!jobsLoadedOnce) {
        setJobsLoading(false)
      }
    }
  }, [jobsLoadedOnce])

  const loadDetail = useCallback(async (jobId: string | null) => {
    if (!jobId) return
    const requestId = detailRequestIdRef.current + 1
    detailRequestIdRef.current = requestId
    setDetailLoading(true)
    setDetailError(null)
    try {
      const response = await fetch(`/admin/api/agent/jobs/${jobId}`)
      const json = (await response.json()) as AgentJobDetailResponse
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to load job detail.")
      }

      if (detailRequestIdRef.current !== requestId) return
      setDetail(json)
    } catch (error) {
      if (detailRequestIdRef.current !== requestId) return
      setDetail(null)
      setDetailError(toErrorMessage(error, "Failed to load job detail."))
    } finally {
      if (detailRequestIdRef.current === requestId) {
        setDetailLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadStatus()
    void loadPages()
    void loadJobs()
  }, [loadJobs, loadPages, loadStatus])

  useEffect(() => {
    setDetail(null)
    setDetailError(null)
    setDetailLoading(Boolean(selectedJobId))
    void loadDetail(selectedJobId)
  }, [selectedJobId, loadDetail])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadStatus()
      void loadPages()
      void loadJobs()
      if (selectedJobId) {
        void loadDetail(selectedJobId)
      }
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [selectedJobId, loadDetail, loadJobs, loadPages, loadStatus])

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  )

  const selectedDetail = useMemo(
    () => (detail?.job.id === selectedJobId ? detail : null),
    [detail, selectedJobId]
  )

  const selectedPhase3 = useMemo(() => {
    if (selectedDetail?.job.id === selectedJobId) {
      return readPhase3Result(selectedDetail.job.result)
    }
    return selectedJob ? readPhase3Result(selectedJob.result) : null
  }, [selectedDetail, selectedJob, selectedJobId])

  const touchedPages = useMemo(() => {
    const slugs = selectedPhase3?.touchedPageSlugs ?? []
    return slugs.map((slug) => ({
      slug,
      pageId: pageIdBySlug[slug] ?? null,
    }))
  }, [pageIdBySlug, selectedPhase3])

  useEffect(() => {
    const hasTouchedPages = Boolean(selectedPhase3?.touchedPageSlugs?.length)
    if (!hasTouchedPages) return
    void loadPages()
  }, [loadPages, selectedPhase3])

  const onSubmit = useCallback(async (mode: "plan-only" | "apply") => {
    setCreating(mode)
    setCreateError(null)
    setCreateSuccess(null)
    setActionError(null)
    setActionSuccess(null)

    const nextPrompt = prompt.trim()
    if (!nextPrompt) {
      setCreateError("A website brief or JSON prompt is required.")
      setCreating(null)
      return
    }

    try {
      const payload = mode === "apply"
        ? { prompt: nextPrompt, apply: true }
        : { prompt: nextPrompt, dryRun: true }

      const response = await fetch("/admin/api/agent/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "site_build_draft",
          payload,
        }),
      })

      const json = (await response.json()) as {
        job?: AgentJob
        error?: string
        conflict?: {
          jobId?: string | null
          status?: string | null
          cancellationState?: string | null
        }
      }
      if (!response.ok || !json.job) {
        throw new Error(
          response.status === 409
            ? formatConflictMessage(json)
            : (json.error ?? "Failed to create agent job.")
        )
      }

      setCreateSuccess(
        mode === "apply"
          ? "Draft creation job submitted. Review and publish remain manual."
          : "Plan-only review job submitted."
      )
      setSelectedJobId(json.job.id)
      await Promise.all([loadJobs(), loadDetail(json.job.id), loadPages(), loadStatus()])
    } catch (error) {
      setCreateError(toErrorMessage(error, "Failed to create agent job."))
    } finally {
      setCreating(null)
    }
  }, [loadDetail, loadJobs, loadPages, loadStatus, prompt])

  const onCancel = useCallback(async () => {
    if (!selectedJob) return
    setActing("cancel")
    setActionError(null)
    setActionSuccess(null)
    try {
      const response = await fetch(`/admin/api/agent/jobs/${selectedJob.id}/cancel`, {
        method: "POST",
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to cancel agent job.")
      }

      setActionSuccess("Cancel request submitted.")
      await Promise.all([loadJobs(), loadDetail(selectedJob.id), loadStatus()])
    } catch (error) {
      setActionError(toErrorMessage(error, "Failed to cancel agent job."))
    } finally {
      setActing(null)
    }
  }, [loadDetail, loadJobs, loadStatus, selectedJob])

  const onRollback = useCallback(async () => {
    if (!selectedJob) return
    setActing("rollback")
    setActionError(null)
    setActionSuccess(null)
    try {
      const response = await fetch(`/admin/api/agent/jobs/${selectedJob.id}/rollback`, {
        method: "POST",
      })
      const json = (await response.json()) as { error?: string; snapshotId?: string }
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to rollback agent job.")
      }

      setActionSuccess(
        json.snapshotId ? `Rollback completed from snapshot ${json.snapshotId}.` : "Rollback completed."
      )
      await Promise.all([loadJobs(), loadDetail(selectedJob.id), loadPages(), loadStatus()])
    } catch (error) {
      setActionError(toErrorMessage(error, "Failed to rollback agent job."))
    } finally {
      setActing(null)
    }
  }, [loadDetail, loadJobs, loadPages, loadStatus, selectedJob])

  const onApplyReviewed = useCallback(async () => {
    if (!selectedJob) return
    setActing("apply-reviewed")
    setActionError(null)
    setActionSuccess(null)
    try {
      const response = await fetch(`/admin/api/agent/jobs/${selectedJob.id}/apply-reviewed`, {
        method: "POST",
      })
      const json = (await response.json()) as {
        error?: string
        job?: AgentJob
        conflict?: {
          jobId?: string | null
          status?: string | null
          cancellationState?: string | null
        }
      }
      if (!response.ok || !json.job) {
        throw new Error(
          response.status === 409
            ? formatConflictMessage(json)
            : (json.error ?? "Failed to apply reviewed plan.")
        )
      }

      setActionSuccess(
        `Reviewed plan queued as draft job ${json.job.id}. The stored canonical plan will be applied without rerunning the planner.`
      )
      setSelectedJobId(json.job.id)
      await Promise.all([loadJobs(), loadDetail(json.job.id), loadPages(), loadStatus()])
    } catch (error) {
      setActionError(toErrorMessage(error, "Failed to apply reviewed plan."))
    } finally {
      setActing(null)
    }
  }, [loadDetail, loadJobs, loadPages, loadStatus, selectedJob])

  const promptMode = useMemo(() => detectPromptModeOnClient(prompt), [prompt])
  const draftEnqueueBlocked = Boolean(status?.controls?.draftExecution?.enqueueBlocked)
  const plannerConfigured = Boolean(status?.providers?.planner?.configured)
  const imageGenerationConfigured = Boolean(status?.providers?.imageGeneration?.configured)
  const selectedGeneratedImageCount = useMemo(
    () => countGeneratedBackgroundImages(selectedPhase3),
    [selectedPhase3]
  )
  const createBlockedReason = draftEnqueueBlocked
    ? formatDraftExecutionReason(status)
    : status && promptMode === "natural-language" && !plannerConfigured
      ? status?.providers?.planner?.configError ??
        "Natural-language planning is unavailable until GEMINI_API_KEY is configured. Paste JSON instead or configure the planner provider."
      : null
  const reviewedApplyBlockedReason = draftEnqueueBlocked
    ? formatDraftExecutionReason(status)
    : status && selectedPhase3?.mode === "plan-only" && selectedGeneratedImageCount > 0 && !imageGenerationConfigured
      ? status?.providers?.imageGeneration?.configError ??
        "Generated background images are unavailable until GEMINI_API_KEY is configured."
      : null
  const reviewedApplyEligible = Boolean(
    selectedJob &&
      isReviewedApplyEligible(selectedJob, selectedPhase3, draftEnqueueBlocked) &&
      !reviewedApplyBlockedReason
  )
  const failureDescription = selectedJob
    ? describeFailure(selectedPhase3, selectedJob)
    : selectedDetail?.job
      ? describeFailure(selectedPhase3, selectedDetail.job)
      : null

  return (
    <Stack spacing={2}>
      <WorkspaceHeader title="Agent" />

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
        <Stack spacing={2} sx={{ flex: 1.1, minWidth: 0 }}>
          <WorkspacePanel
            title="Status"
            description="Non-secret runtime and worker status for the local agent workspace."
          >
            {statusLoading && !status ? (
              <AdminLoadingState message="Loading agent status…" />
            ) : statusError ? (
              <AdminErrorState message={statusError} onRetry={() => void loadStatus()} />
            ) : status ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Runtime: ${status.runtime}`} size="small" />
                  <Chip
                    label={status.worker.configured ? "Worker configured" : "Worker not configured"}
                    size="small"
                    color={status.worker.configured ? "success" : "warning"}
                    variant="outlined"
                  />
                  <Chip
                    label={status.worker.online ? "Worker online" : status.worker.stale ? "Worker stale" : "Worker offline"}
                    size="small"
                    color={status.worker.online ? "success" : status.worker.stale ? "warning" : "default"}
                    variant="outlined"
                  />
                  <Chip
                    label={`Rollback: ${status.rollbackSupported ? "supported" : "unavailable"}`}
                    size="small"
                    color={status.rollbackSupported ? "success" : "default"}
                    variant="outlined"
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Worker service: {status.worker.serviceName} · {status.worker.serviceInstalled ? "installed" : "not installed"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Worker id: {status.worker.workerId ?? "Not available"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last heartbeat: {formatDateTime(status.worker.lastHeartbeatAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Worker started: {formatDateTime(status.worker.startedAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported jobs: {status.supportedJobKinds.join(", ")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Poll interval: {status.worker.pollIntervalMs ?? "Not available"} ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stale after: {status.worker.staleAfterMs ?? "Not available"} ms
                </Typography>

                {status.worker.configError ? (
                  <Alert severity="warning" variant="outlined">
                    {status.worker.configError}
                  </Alert>
                ) : null}

                {status.providers?.imageGeneration ? (
                  <AdminPanel compact>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">Provider status</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Generated images: {status.providers.imageGeneration.provider} · {status.providers.imageGeneration.configured ? "configured" : "not configured"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Model: {status.providers.imageGeneration.model ?? "Not available"}
                      </Typography>
                      {status.providers.imageGeneration.configError ? (
                        <Alert severity="warning" variant="outlined">
                          {status.providers.imageGeneration.configError}
                        </Alert>
                      ) : null}
                      {status.providers.planner ? (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Planner: {status.providers.planner.provider} · {status.providers.planner.configured ? "configured" : "not configured"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Planner model: {status.providers.planner.model ?? "Not available"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Structured output: {status.providers.planner.structuredOutput ? "required" : "not required"}
                          </Typography>
                          {status.providers.planner.configError ? (
                            <Alert severity="warning" variant="outlined">
                              {status.providers.planner.configError}
                            </Alert>
                          ) : null}
                        </>
                      ) : null}
                    </Stack>
                  </AdminPanel>
                ) : null}

                {status.controls?.draftExecution ? (
                  <AdminPanel compact>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">Draft execution</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mode: {status.controls.draftExecution.mode} · {status.controls.draftExecution.enqueueBlocked ? "enqueue blocked" : "enqueue open"}
                      </Typography>
                      {status.controls.draftExecution.activeJobId ? (
                        <Typography variant="caption" color="text.secondary">
                          Active draft job: {status.controls.draftExecution.activeJobId} · {status.controls.draftExecution.activeJobStatus ?? "unknown"} · {status.controls.draftExecution.cancellationState ?? "unknown"}
                        </Typography>
                      ) : null}
                      {status.controls.draftExecution.enqueueReason ? (
                        <Alert severity="warning" variant="outlined">
                          {status.controls.draftExecution.enqueueReason}
                        </Alert>
                      ) : null}
                    </Stack>
                  </AdminPanel>
                ) : null}

                {status.retryPolicy ? (
                  <AdminPanel compact>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">Retry policy</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stale recovery: {status.retryPolicy.staleRecovery}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Draft apply protection: {status.retryPolicy.draftApplyProtection}
                      </Typography>
                    </Stack>
                  </AdminPanel>
                ) : null}

                {status.v1Scope ? (
                  <AdminPanel compact>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">V1 scope</Typography>
                      <Typography variant="body2" color="text.secondary">
                        No auto-publish: {status.v1Scope.autoPublish ? "no" : "yes"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No custom section schema creation: {status.v1Scope.customSectionSchemaCreation ? "no" : "yes"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No public worker ingress: {status.v1Scope.publicWorkerIngress ? "no" : "yes"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Publish requires human review: {status.v1Scope.publishRequiresHumanReview ? "yes" : "no"}
                      </Typography>
                    </Stack>
                  </AdminPanel>
                ) : null}

                {status.latestActivity ? (
                  <AdminPanel compact>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">Latest activity</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {status.latestActivity.kind} · {status.latestActivity.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Updated {formatDateTime(status.latestActivity.updatedAt)}
                      </Typography>
                      {status.latestActivity.cancellationState ? (
                        <Typography variant="caption" color="text.secondary">
                          Cancellation: {status.latestActivity.cancellationState}
                        </Typography>
                      ) : null}
                      {status.latestActivity.latestRun ? (
                        <Typography variant="caption" color="text.secondary">
                          Run #{status.latestActivity.latestRun.runNumber} · {status.latestActivity.latestRun.status}
                        </Typography>
                      ) : null}
                    </Stack>
                  </AdminPanel>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent agent activity yet.
                  </Typography>
                )}
              </Stack>
            ) : null}
          </WorkspacePanel>

          <WorkspacePanel
            title="Create Job"
            description="Start from a natural-language brief, review the stored plan, then create CMS drafts. JSON remains an advanced fallback, and nothing here publishes the site."
            actions={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void onSubmit("plan-only")}
                  disabled={creating !== null || Boolean(createBlockedReason)}
                >
                  {creating === "plan-only" ? "Submitting…" : "Plan Only"}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => void onSubmit("apply")}
                  disabled={creating !== null || Boolean(createBlockedReason)}
                >
                  {creating === "apply" ? "Submitting…" : "Create Draft"}
                </Button>
              </Stack>
            }
          >
            <Stack spacing={1.5}>
              {createError ? <AdminErrorState message={createError} /> : null}
              {createSuccess ? (
                <Alert severity="success" variant="outlined">
                  {createSuccess}
                </Alert>
              ) : null}

              <Typography variant="body2" color="text.secondary">
                `Plan Only` stores a reviewable canonical plan. `Create Draft` writes CMS draft changes only. Publishing still requires separate human review.
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Input mode: {promptMode === "json" ? "JSON fallback" : "Natural language"} · Limits: {AGENT_DRAFT_PROMPT_MAX_CHARS.toLocaleString()} chars, {AGENT_DRAFT_MAX_PAGES} pages, {AGENT_DRAFT_MAX_SECTIONS} sections, {AGENT_DRAFT_MAX_GENERATED_IMAGES} generated background images per run.
              </Typography>

              {createBlockedReason ? (
                <Alert severity="warning" variant="outlined">
                  {createBlockedReason}
                </Alert>
              ) : (!plannerConfigured && promptMode === "json") ? (
                <Alert severity="info" variant="outlined">
                  Natural-language planning is unavailable right now, but pasted JSON prompts can still be queued.
                </Alert>
              ) : null}

              <Box
                component="textarea"
                aria-label="Website brief or JSON prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.currentTarget.value)}
                style={{
                  width: "100%",
                  minHeight: 220,
                  resize: "vertical",
                  borderRadius: 12,
                  padding: 12,
                  border: "1px solid rgba(142,162,255,0.18)",
                  background: "rgba(10,15,27,0.56)",
                  color: "inherit",
                  fontFamily: "monospace",
                  fontSize: 13,
                }}
              />

              <Alert severity="info" variant="outlined">
                Draft-only workflow: review the plan first, then apply the reviewed stored plan or create a fresh draft job. No auto-publish is performed here.
              </Alert>
            </Stack>
          </WorkspacePanel>
        </Stack>

        <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <WorkspacePanel title="Recent Jobs" description="Recent site-build jobs from the shared agent queue.">
            {jobsLoading && !jobs.length ? (
              <AdminLoadingState message="Loading jobs…" />
            ) : jobsError ? (
              <AdminErrorState message={jobsError} onRetry={() => void loadJobs()} />
            ) : jobs.length ? (
              <List dense sx={{ p: 0 }}>
                {jobs.map((job) => (
                  <ListItemButton
                    key={job.id}
                    selected={job.id === selectedJobId}
                    onClick={() => setSelectedJobId(job.id)}
                    divider
                  >
                    <ListItemText
                      primary={`${job.kind} · ${job.status}`}
                      secondary={
                        job.latestRun
                          ? `Run #${job.latestRun.run_number} · ${job.latestRun.status} · Updated ${formatDateTime(job.updated_at)}`
                          : `Created ${formatDateTime(job.created_at)}`
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <AdminEmptyState
                title="No agent jobs yet"
                description="Create a structured draft-generation job to populate this queue."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            title="Job Detail"
            description="Prompt, plan summary, logs, touched pages, and approved actions for the selected job."
            actions={
              selectedJob ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => void onApplyReviewed()}
                    disabled={!reviewedApplyEligible || acting !== null}
                  >
                    {acting === "apply-reviewed" ? "Queuing…" : "Apply Reviewed Plan"}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => void onCancel()}
                    disabled={!isCancelEligible(selectedJob) || acting !== null}
                  >
                    {acting === "cancel" ? "Canceling…" : "Cancel"}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => void onRollback()}
                    disabled={!isRollbackEligible(selectedJob, selectedPhase3) || acting !== null}
                  >
                    {acting === "rollback" ? "Rolling Back…" : "Rollback"}
                  </Button>
                </Stack>
              ) : null
            }
          >
            {actionError ? <AdminErrorState message={actionError} sx={{ mb: 1.5 }} /> : null}
            {actionSuccess ? (
              <Alert severity="success" variant="outlined" sx={{ mb: 1.5 }}>
                {actionSuccess}
              </Alert>
            ) : null}

            {detailLoading && !selectedDetail ? (
              <AdminLoadingState message="Loading job detail…" />
            ) : detailError ? (
              <AdminErrorState message={detailError} onRetry={() => void loadDetail(selectedJobId)} />
            ) : selectedJob && selectedDetail ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Status: ${selectedJob.status}`} size="small" />
                  <Chip label={`Kind: ${selectedJob.kind}`} size="small" variant="outlined" />
                  {selectedPhase3?.mode ? (
                    <Chip
                      label={`Mode: ${selectedPhase3.mode === "plan-only" ? "review" : "draft apply"}`}
                      size="small"
                      variant="outlined"
                    />
                  ) : null}
                  {selectedPhase3?.applyState ? (
                    <Chip label={`Apply: ${selectedPhase3.applyState}`} size="small" variant="outlined" />
                  ) : null}
                </Stack>

                {selectedPhase3?.mode === "plan-only" ? (
                  <Alert severity="info" variant="outlined">
                    Review this stored plan before applying it. `Apply Reviewed Plan` creates a new audited draft job without rerunning the planner.
                  </Alert>
                ) : null}

                {selectedPhase3?.reviewedSourceJobId ? (
                  <Alert severity="success" variant="outlined">
                    This draft job was applied from reviewed plan job {selectedPhase3.reviewedSourceJobId}.
                  </Alert>
                ) : null}

                <Typography variant="subtitle2">Submitted prompt</Typography>
                <AdminPanel compact>
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{ m: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "monospace" }}
                  >
                    {typeof selectedJob.payload.prompt === "string"
                      ? selectedJob.payload.prompt
                      : "No prompt text available."}
                  </Typography>
                </AdminPanel>

                <Typography variant="subtitle2">Plan summary</Typography>
                <AdminPanel compact>
                  {selectedPhase3?.planSummary ? (
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Pages: {selectedPhase3.planSummary.pageCount ?? "Not available"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sections: {selectedPhase3.planSummary.sectionCount ?? "Not available"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Theme changes: {selectedPhase3.planSummary.themeChangeCount ?? "Not available"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Theme preset: {selectedPhase3.planSummary.themePresetId ?? "Not changed"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Theme settings: {selectedPhase3.planSummary.hasThemeSettings ? "Included" : "Not included"}
                      </Typography>
                      {selectedPhase3.planSummary.sectionsByPage?.length ? (
                        <Stack spacing={0.75} sx={{ pt: 0.5 }}>
                          {selectedPhase3.planSummary.sectionsByPage.map((page) => (
                            <Box key={page.slug}>
                              <Typography variant="body2" color="text.secondary">
                                {page.title} ({page.slug}) · {page.sectionCount} sections
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {page.sectionTypes.join(", ")}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No plan summary is available for this job yet.
                    </Typography>
                  )}
                </AdminPanel>

                <Typography variant="subtitle2">Planner review</Typography>
                <AdminPanel compact>
                  {selectedPhase3?.planner ? (
                    <Stack spacing={0.75}>
                      <Typography variant="body2" color="text.secondary">
                        Input mode: {formatInputMode(selectedPhase3.planner.inputMode)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Provider: {selectedPhase3.planner.provider ?? "Not used"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Model: {selectedPhase3.planner.model ?? "Not available"}
                      </Typography>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Assumptions
                        </Typography>
                        {selectedPhase3.planner.assumptions?.length ? (
                          <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                            {selectedPhase3.planner.assumptions.map((entry) => (
                              <Typography key={entry} variant="caption" color="text.secondary">
                                • {entry}
                              </Typography>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No planner assumptions recorded.
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Warnings
                        </Typography>
                        {selectedPhase3.planner.warnings?.length ? (
                          <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                            {selectedPhase3.planner.warnings.map((entry) => (
                              <Typography key={entry} variant="caption" color="text.secondary">
                                • {entry}
                              </Typography>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No planner warnings recorded.
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Downgraded requests
                        </Typography>
                        {selectedPhase3.planner.downgradedRequests?.length ? (
                          <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                            {selectedPhase3.planner.downgradedRequests.map((entry) => (
                              <Typography key={entry} variant="caption" color="text.secondary">
                                • {entry}
                              </Typography>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No downgraded requests recorded.
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No planner review metadata is available for this job yet.
                    </Typography>
                  )}
                </AdminPanel>

                {selectedPhase3?.mode === "plan-only" && reviewedApplyBlockedReason ? (
                  <Alert severity="warning" variant="outlined">
                    {reviewedApplyBlockedReason}
                  </Alert>
                ) : null}

                {selectedGeneratedImageCount > 0 && !imageGenerationConfigured ? (
                  <Alert severity="warning" variant="outlined">
                    This stored plan includes {selectedGeneratedImageCount} generated background image{selectedGeneratedImageCount === 1 ? "" : "s"}. Apply will stay blocked until the image provider is configured.
                  </Alert>
                ) : null}

                {failureDescription ? (
                  <>
                    <Typography variant="subtitle2">Failure</Typography>
                    <Alert severity="error" variant="outlined">
                      {failureDescription}
                    </Alert>
                  </>
                ) : null}

                <Typography variant="subtitle2">Touched pages</Typography>
                <AdminPanel compact>
                  {touchedPages.length ? (
                    <Stack spacing={0.75}>
                      {touchedPages.map((page) =>
                        page.pageId ? (
                          <Link key={page.slug} href={`/admin/pages/${page.pageId}/visual`}>
                            {page.slug}
                          </Link>
                        ) : (
                          <Typography key={page.slug} variant="body2" color="text.secondary">
                            {page.slug} (unresolved)
                          </Typography>
                        )
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No touched pages recorded yet.
                    </Typography>
                  )}
                </AdminPanel>

                <Typography variant="subtitle2">Logs</Typography>
                <AdminPanel compact>
                  {selectedDetail.logs.length ? (
                    <Stack spacing={0.75}>
                      {selectedDetail.logs.map((log) => (
                        <Typography key={log.id} variant="body2" color="text.secondary">
                          [{log.level}] {log.message}
                        </Typography>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No logs recorded for this job yet.
                    </Typography>
                  )}
                </AdminPanel>
              </Stack>
            ) : (
              <AdminEmptyState
                title="Select an agent job"
                description="Choose a recent job to inspect its prompt, plan summary, logs, and touched pages."
              />
            )}
          </WorkspacePanel>
        </Stack>
      </Stack>
    </Stack>
  )
}
