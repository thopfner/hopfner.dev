import { beforeEach, describe, expect, it, vi } from "vitest"

const requireAdminMock = vi.fn()
const getSupabaseAdminMock = vi.fn()
const listAgentJobsMock = vi.fn()
const findActiveAgentJobConflictMock = vi.fn()
const parseAgentWorkerConfigMock = vi.fn()
const readAgentWorkerLivenessStatusMock = vi.fn()
const readAgentWorkerProviderStatusMock = vi.fn()

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdminMock(),
}))

vi.mock("@/lib/supabase/server-admin", () => ({
  getSupabaseAdmin: () => getSupabaseAdminMock(),
}))

vi.mock("@/lib/agent/jobs/service", () => ({
  listAgentJobs: (...args: unknown[]) => listAgentJobsMock(...args),
  findActiveAgentJobConflict: (...args: unknown[]) => findActiveAgentJobConflictMock(...args),
}))

vi.mock("@/lib/agent/jobs/worker-config", () => ({
  parseAgentWorkerConfig: (...args: unknown[]) => parseAgentWorkerConfigMock(...args),
}))

vi.mock("@/lib/agent/jobs/worker-service", () => ({
  readAgentWorkerLivenessStatus: (...args: unknown[]) => readAgentWorkerLivenessStatusMock(...args),
  readAgentWorkerProviderStatus: (...args: unknown[]) => readAgentWorkerProviderStatusMock(...args),
}))

describe("GET /admin/api/agent/status", () => {
  const supabaseMock = { service: "admin" }

  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminMock.mockResolvedValue({ ok: true, userId: "user-1" })
    getSupabaseAdminMock.mockReturnValue(supabaseMock)
    listAgentJobsMock.mockResolvedValue([])
    findActiveAgentJobConflictMock.mockResolvedValue(null)
    parseAgentWorkerConfigMock.mockReturnValue({
      once: false,
      workerId: "agent-worker-demo",
      validateOnly: false,
      pollIntervalMs: 5000,
      staleAfterMs: 60000,
    })
    readAgentWorkerLivenessStatusMock.mockResolvedValue({
      serviceName: "hopfner-agent-worker.service",
      serviceInstalled: false,
      online: false,
      stale: false,
      lastHeartbeatAt: null,
      workerId: null,
      startedAt: null,
    })
    readAgentWorkerProviderStatusMock.mockReturnValue({
      imageGeneration: {
        provider: "gemini",
        configured: false,
        model: null,
        configError: "Generated background images are unavailable until GEMINI_API_KEY is configured.",
      },
      planner: {
        provider: "gemini",
        configured: false,
        model: null,
        structuredOutput: true,
        configError: "Natural-language planning is unavailable until GEMINI_API_KEY is configured.",
      },
    })
  })

  it("returns non-secret runtime status with the latest activity summary", async () => {
    findActiveAgentJobConflictMock.mockResolvedValueOnce({
      jobId: "job-1",
      kind: "site_build_draft",
      status: "running",
      cancellationState: "cancel_requested",
    })
    listAgentJobsMock.mockResolvedValueOnce([
      {
        id: "job-1",
        kind: "site_build_draft",
        status: "running",
        cancel_requested_at: "2026-03-27T00:00:08.000Z",
        created_at: "2026-03-27T00:00:00.000Z",
        updated_at: "2026-03-27T00:00:10.000Z",
        latestRun: {
          run_number: 2,
          status: "running",
          claimed_at: "2026-03-27T00:00:01.000Z",
          started_at: "2026-03-27T00:00:02.000Z",
          finished_at: null,
          heartbeat_at: "2026-03-27T00:00:09.000Z",
        },
      },
    ])

    const { GET } = await import("@/app/admin/api/agent/status/route")
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(listAgentJobsMock).toHaveBeenCalledWith(supabaseMock, { limit: 1 })
    expect(findActiveAgentJobConflictMock).toHaveBeenCalledWith(supabaseMock, "site_build_draft")
    expect(readAgentWorkerLivenessStatusMock).toHaveBeenCalledWith({ staleAfterMs: 60000 })
    expect(json).toEqual({
      status: {
        runtime: "local-worker",
        supportedJobKinds: ["site_build_noop", "site_build_draft"],
        rollbackSupported: true,
        worker: {
          configured: true,
          serviceName: "hopfner-agent-worker.service",
          serviceInstalled: false,
          online: false,
          stale: false,
          lastHeartbeatAt: null,
          workerId: null,
          startedAt: null,
          pollIntervalMs: 5000,
          staleAfterMs: 60000,
          configError: null,
        },
        providers: {
          imageGeneration: {
            provider: "gemini",
            configured: false,
            model: null,
            configError:
              "Generated background images are unavailable until GEMINI_API_KEY is configured.",
          },
          planner: {
            provider: "gemini",
            configured: false,
            model: null,
            structuredOutput: true,
            configError:
              "Natural-language planning is unavailable until GEMINI_API_KEY is configured.",
          },
        },
        controls: {
          draftExecution: {
            mode: "serialized",
            enqueueBlocked: true,
            enqueueReason: "Draft jobs are serialized on this deployment while job-1 is running (cancel_requested).",
            activeJobId: "job-1",
            activeJobStatus: "running",
            cancellationState: "cancel_requested",
          },
        },
        retryPolicy: {
          staleRecovery: "requeue-unless-cancel-requested",
          draftApplyProtection: "idempotency-result-and-rollback-snapshot",
        },
        v1Scope: {
          autoPublish: false,
          customSectionSchemaCreation: false,
          publicWorkerIngress: false,
          publishRequiresHumanReview: true,
        },
        latestActivity: {
          jobId: "job-1",
          kind: "site_build_draft",
          status: "running",
          cancellationState: "cancel_requested",
          createdAt: "2026-03-27T00:00:00.000Z",
          updatedAt: "2026-03-27T00:00:10.000Z",
          latestRun: {
            runNumber: 2,
            status: "running",
            claimedAt: "2026-03-27T00:00:01.000Z",
            startedAt: "2026-03-27T00:00:02.000Z",
            finishedAt: null,
            heartbeatAt: "2026-03-27T00:00:09.000Z",
          },
        },
      },
    })
  })

  it("returns a safe config error state when worker config parsing fails", async () => {
    parseAgentWorkerConfigMock.mockImplementationOnce(() => {
      throw new Error("AGENT_WORKER_STALE_AFTER_MS must be greater than AGENT_WORKER_POLL_INTERVAL_MS.")
    })

    const { GET } = await import("@/app/admin/api/agent/status/route")
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.status.worker).toEqual({
      configured: false,
      serviceName: "hopfner-agent-worker.service",
      serviceInstalled: false,
      online: false,
      stale: false,
      lastHeartbeatAt: null,
      workerId: null,
      startedAt: null,
      pollIntervalMs: null,
      staleAfterMs: null,
      configError: "AGENT_WORKER_STALE_AFTER_MS must be greater than AGENT_WORKER_POLL_INTERVAL_MS.",
    })
    expect(json.status.providers).toEqual({
      imageGeneration: {
        provider: "gemini",
        configured: false,
        model: null,
        configError: "Generated background images are unavailable until GEMINI_API_KEY is configured.",
      },
      planner: {
        provider: "gemini",
        configured: false,
        model: null,
        structuredOutput: true,
        configError: "Natural-language planning is unavailable until GEMINI_API_KEY is configured.",
      },
    })
  })

  it("returns guarded auth failures before touching services", async () => {
    requireAdminMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Not authorized.",
    })

    const { GET } = await import("@/app/admin/api/agent/status/route")
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json).toEqual({ error: "Not authorized." })
    expect(listAgentJobsMock).not.toHaveBeenCalled()
  })
})
