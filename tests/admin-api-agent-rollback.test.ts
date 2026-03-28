import { beforeEach, describe, expect, it, vi } from "vitest"

import { AgentJobNotFoundError } from "@/lib/agent/jobs/errors"

const requireAdminMock = vi.fn()
const getSupabaseAdminMock = vi.fn()
const getAgentJobDetailMock = vi.fn()
const rollbackAgentDraftSnapshotMock = vi.fn()

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdminMock(),
}))

vi.mock("@/lib/supabase/server-admin", () => ({
  getSupabaseAdmin: () => getSupabaseAdminMock(),
}))

vi.mock("@/lib/agent/jobs/service", () => ({
  getAgentJobDetail: (...args: unknown[]) => getAgentJobDetailMock(...args),
}))

vi.mock("@/lib/agent/execution/snapshots", () => ({
  rollbackAgentDraftSnapshot: (...args: unknown[]) => rollbackAgentDraftSnapshotMock(...args),
}))

describe("POST /admin/api/agent/jobs/[jobId]/rollback", () => {
  const supabaseMock = { service: "admin" }

  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminMock.mockResolvedValue({ ok: true, userId: "user-1" })
    getSupabaseAdminMock.mockReturnValue(supabaseMock)
    rollbackAgentDraftSnapshotMock.mockResolvedValue({
      id: "snapshot-1",
      target_page_slugs: ["home", "launch"],
    })
  })

  it("rolls back completed apply-mode draft jobs via the existing snapshot helper", async () => {
    getAgentJobDetailMock.mockResolvedValueOnce({
      job: {
        id: "job-1",
        status: "completed",
        result: {
          phase3: {
            mode: "apply",
            applyRequested: true,
            applyState: "applied",
            rollbackSnapshotId: "snapshot-1",
            touchedPageSlugs: ["home", "launch"],
          },
        },
      },
      runs: [],
      logs: [],
    })

    const { POST } = await import("@/app/admin/api/agent/jobs/[jobId]/rollback/route")
    const response = await POST(new Request("http://localhost/admin/api/agent/jobs/job-1/rollback", {
      method: "POST",
    }), {
      params: Promise.resolve({ jobId: "job-1" }),
    })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(getAgentJobDetailMock).toHaveBeenCalledWith(supabaseMock, "job-1")
    expect(rollbackAgentDraftSnapshotMock).toHaveBeenCalledWith(supabaseMock, "snapshot-1")
    expect(json).toEqual({
      ok: true,
      snapshotId: "snapshot-1",
      touchedPageSlugs: ["home", "launch"],
    })
  })

  it("rejects plan-only or non-applied jobs with a 400 response", async () => {
    getAgentJobDetailMock.mockResolvedValueOnce({
      job: {
        id: "job-1",
        status: "completed",
        result: {
          phase3: {
            mode: "plan-only",
            applyRequested: false,
            applyState: "not_applied",
            rollbackSnapshotId: null,
            touchedPageSlugs: ["home"],
          },
        },
      },
      runs: [],
      logs: [],
    })

    const { POST } = await import("@/app/admin/api/agent/jobs/[jobId]/rollback/route")
    const response = await POST(new Request("http://localhost/admin/api/agent/jobs/job-1/rollback", {
      method: "POST",
    }), {
      params: Promise.resolve({ jobId: "job-1" }),
    })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({
      error: "Rollback is only available for completed apply-mode draft jobs.",
    })
    expect(rollbackAgentDraftSnapshotMock).not.toHaveBeenCalled()
  })

  it("rejects non-completed jobs even when the phase3 apply result looks rollback-capable", async () => {
    getAgentJobDetailMock.mockResolvedValueOnce({
      job: {
        id: "job-1",
        status: "running",
        result: {
          phase3: {
            mode: "apply",
            applyRequested: true,
            applyState: "applied",
            rollbackSnapshotId: "snapshot-1",
            touchedPageSlugs: ["home"],
          },
        },
      },
      runs: [],
      logs: [],
    })

    const { POST } = await import("@/app/admin/api/agent/jobs/[jobId]/rollback/route")
    const response = await POST(new Request("http://localhost/admin/api/agent/jobs/job-1/rollback", {
      method: "POST",
    }), {
      params: Promise.resolve({ jobId: "job-1" }),
    })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({
      error: "Rollback is only available for completed apply-mode draft jobs.",
    })
    expect(rollbackAgentDraftSnapshotMock).not.toHaveBeenCalled()
  })

  it("maps missing jobs to 404", async () => {
    getAgentJobDetailMock.mockRejectedValueOnce(new AgentJobNotFoundError("Agent job not found."))

    const { POST } = await import("@/app/admin/api/agent/jobs/[jobId]/rollback/route")
    const response = await POST(new Request("http://localhost/admin/api/agent/jobs/job-404/rollback", {
      method: "POST",
    }), {
      params: Promise.resolve({ jobId: "job-404" }),
    })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json).toEqual({ error: "Agent job not found." })
  })
})
