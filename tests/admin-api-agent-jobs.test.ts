import { beforeEach, describe, expect, it, vi } from "vitest"

import { AgentJobNotFoundError, AgentJobValidationError } from "@/lib/agent/jobs/errors"

const requireAdminMock = vi.fn()
const getSupabaseAdminMock = vi.fn()
const listAgentJobsMock = vi.fn()
const enqueueAgentJobMock = vi.fn()
const findActiveAgentJobConflictMock = vi.fn()
const getAgentJobDetailMock = vi.fn()
const cancelAgentJobMock = vi.fn()
const createReviewedPlanApplyJobMock = vi.fn()

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdminMock(),
}))

vi.mock("@/lib/supabase/server-admin", () => ({
  getSupabaseAdmin: () => getSupabaseAdminMock(),
}))

vi.mock("@/lib/agent/jobs/service", () => ({
  listAgentJobs: (...args: unknown[]) => listAgentJobsMock(...args),
  enqueueAgentJob: (...args: unknown[]) => enqueueAgentJobMock(...args),
  findActiveAgentJobConflict: (...args: unknown[]) => findActiveAgentJobConflictMock(...args),
  getAgentJobDetail: (...args: unknown[]) => getAgentJobDetailMock(...args),
  cancelAgentJob: (...args: unknown[]) => cancelAgentJobMock(...args),
  createReviewedPlanApplyJob: (...args: unknown[]) => createReviewedPlanApplyJobMock(...args),
}))

describe("admin agent job routes", () => {
  const supabaseMock = { service: "admin" }

  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminMock.mockResolvedValue({ ok: true, userId: "user-1" })
    getSupabaseAdminMock.mockReturnValue(supabaseMock)
    findActiveAgentJobConflictMock.mockResolvedValue(null)
  })

  it("lists jobs through the shared service", async () => {
    listAgentJobsMock.mockResolvedValue([
      {
        id: "job-1",
        kind: "site_build_noop",
        status: "queued",
        requested_by: "user-1",
        payload: {},
        result: {},
        worker_id: null,
        claimed_at: null,
        started_at: null,
        finished_at: null,
        cancel_requested_at: null,
        cancel_requested_by: null,
        canceled_at: null,
        canceled_by: null,
        failed_at: null,
        failure_code: null,
        failure_message: null,
        created_at: "2026-03-27T00:00:00.000Z",
        updated_at: "2026-03-27T00:00:00.000Z",
        latestRun: null,
      },
    ])

    const { GET } = await import("@/app/admin/api/agent/jobs/route")
    const response = await GET(new Request("http://localhost/admin/api/agent/jobs?limit=25"))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(listAgentJobsMock).toHaveBeenCalledWith(supabaseMock, { limit: 25 })
    expect(json.jobs).toHaveLength(1)
  })

  it("returns guarded auth failures before calling the service", async () => {
    requireAdminMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Not authorized.",
    })

    const { GET } = await import("@/app/admin/api/agent/jobs/route")
    const response = await GET(new Request("http://localhost/admin/api/agent/jobs"))
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json).toEqual({ error: "Not authorized." })
    expect(listAgentJobsMock).not.toHaveBeenCalled()
  })

  it("creates jobs through the shared enqueue service", async () => {
    enqueueAgentJobMock.mockResolvedValue({
      id: "job-1",
      kind: "site_build_noop",
      status: "queued",
      result: {},
    })

    const { POST } = await import("@/app/admin/api/agent/jobs/route")
    const request = new Request("http://localhost/admin/api/agent/jobs", {
      method: "POST",
      body: JSON.stringify({
        kind: "site_build_noop",
        payload: { siteId: "demo" },
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(enqueueAgentJobMock).toHaveBeenCalledWith(supabaseMock, {
      kind: "site_build_noop",
      payload: { siteId: "demo" },
      requestedBy: "user-1",
    })
    expect(json.job.id).toBe("job-1")
  })

  it("rejects handcrafted reviewed-plan apply payloads through the generic enqueue route", async () => {
    const { POST } = await import("@/app/admin/api/agent/jobs/route")
    const request = new Request("http://localhost/admin/api/agent/jobs", {
      method: "POST",
      body: JSON.stringify({
        kind: "site_build_draft",
        payload: {
          prompt: "Apply the reviewed plan.",
          apply: true,
          reviewedSourceJobId: "job-plan-1",
          reviewedPlan: { version: "phase3.v1" },
          reviewedPlanner: { inputMode: "natural-language" },
        },
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({
      error:
        "Reviewed-plan apply jobs must be created through /admin/api/agent/jobs/[jobId]/apply-reviewed.",
    })
    expect(enqueueAgentJobMock).not.toHaveBeenCalled()
  })

  it("maps enqueue validation errors to 400", async () => {
    enqueueAgentJobMock.mockRejectedValueOnce(
      new AgentJobValidationError("Unsupported agent job kind: bad_kind")
    )

    const { POST } = await import("@/app/admin/api/agent/jobs/route")
    const request = new Request("http://localhost/admin/api/agent/jobs", {
      method: "POST",
      body: JSON.stringify({ kind: "bad_kind" }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({ error: "Unsupported agent job kind: bad_kind" })
  })

  it("rejects overlapping draft jobs with an operator-readable conflict", async () => {
    findActiveAgentJobConflictMock.mockResolvedValueOnce({
      jobId: "job-active",
      kind: "site_build_draft",
      status: "running",
      cancellationState: "cancel_requested",
    })

    const { POST } = await import("@/app/admin/api/agent/jobs/route")
    const request = new Request("http://localhost/admin/api/agent/jobs", {
      method: "POST",
      body: JSON.stringify({
        kind: "site_build_draft",
        payload: { prompt: "{}" },
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(409)
    expect(enqueueAgentJobMock).not.toHaveBeenCalled()
    expect(json).toEqual({
      error: "A site_build_draft job is already active on this deployment.",
      conflict: {
        jobId: "job-active",
        kind: "site_build_draft",
        status: "running",
        cancellationState: "cancel_requested",
      },
    })
  })

  it("returns detail through the shared service and maps not-found to 404", async () => {
    getAgentJobDetailMock.mockResolvedValueOnce({
      job: { id: "job-1", status: "queued" },
      runs: [],
      logs: [],
    })

    const { GET } = await import("@/app/admin/api/agent/jobs/[jobId]/route")
    const okResponse = await GET(new Request("http://localhost/admin/api/agent/jobs/job-1"), {
      params: Promise.resolve({ jobId: "job-1" }),
    })
    const okJson = await okResponse.json()

    expect(okResponse.status).toBe(200)
    expect(getAgentJobDetailMock).toHaveBeenCalledWith(supabaseMock, "job-1")
    expect(okJson.job.id).toBe("job-1")

    getAgentJobDetailMock.mockRejectedValueOnce(new AgentJobNotFoundError("Agent job not found."))

    const missingResponse = await GET(new Request("http://localhost/admin/api/agent/jobs/job-2"), {
      params: Promise.resolve({ jobId: "job-2" }),
    })
    const missingJson = await missingResponse.json()

    expect(missingResponse.status).toBe(404)
    expect(missingJson).toEqual({ error: "Agent job not found." })
  })

  it("cancels jobs through the shared service", async () => {
    cancelAgentJobMock.mockResolvedValue({
      transition: "cancel_requested",
      cancellationState: "cancel_requested",
      job: {
        id: "job-1",
        status: "running",
        result: {},
        cancel_requested_at: "2026-03-27T00:00:00.000Z",
      },
    })

    const { POST } = await import("@/app/admin/api/agent/jobs/[jobId]/cancel/route")
    const response = await POST(new Request("http://localhost/admin/api/agent/jobs/job-1/cancel", {
      method: "POST",
    }), {
      params: Promise.resolve({ jobId: "job-1" }),
    })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(cancelAgentJobMock).toHaveBeenCalledWith(supabaseMock, {
      jobId: "job-1",
      requestedBy: "user-1",
    })
    expect(json).toEqual({
      ok: true,
      transition: "cancel_requested",
      cancellationState: "cancel_requested",
      job: {
        id: "job-1",
        status: "running",
        result: {},
        cancel_requested_at: "2026-03-27T00:00:00.000Z",
      },
    })
  })

  it("creates reviewed-plan apply jobs through the shared service", async () => {
    createReviewedPlanApplyJobMock.mockResolvedValue({
      id: "job-apply-1",
      kind: "site_build_draft",
      status: "queued",
      payload: {
        prompt: "Build a one-page consultancy site.",
        apply: true,
        reviewedSourceJobId: "job-plan-1",
      },
      result: {},
    })

    const { POST } = await import("@/app/admin/api/agent/jobs/[jobId]/apply-reviewed/route")
    const response = await POST(
      new Request("http://localhost/admin/api/agent/jobs/job-plan-1/apply-reviewed", {
        method: "POST",
      }),
      {
        params: Promise.resolve({ jobId: "job-plan-1" }),
      }
    )
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(findActiveAgentJobConflictMock).toHaveBeenCalledWith(supabaseMock, "site_build_draft")
    expect(createReviewedPlanApplyJobMock).toHaveBeenCalledWith(supabaseMock, {
      sourceJobId: "job-plan-1",
      requestedBy: "user-1",
    })
    expect(json).toEqual({
      ok: true,
      sourceJobId: "job-plan-1",
      job: {
        id: "job-apply-1",
        kind: "site_build_draft",
        status: "queued",
        payload: {
          prompt: "Build a one-page consultancy site.",
          apply: true,
          reviewedSourceJobId: "job-plan-1",
        },
        result: {},
      },
    })
  })
})
