import type { AnchorHTMLAttributes, ReactNode } from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AgentWorkspacePageClient } from "@/app/admin/(protected)/agent/page-client"

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: ReactNode
    href: string | { pathname?: string }
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}))

type JsonResponse = {
  ok: boolean
  status?: number
  body: unknown
}

function jsonResponse(input: JsonResponse) {
  return {
    ok: input.ok,
    status: input.status ?? (input.ok ? 200 : 500),
    json: async () => input.body,
  } as Response
}

function deferredResponse() {
  let resolve!: (value: Response) => void
  const promise = new Promise<Response>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const statusPayload = {
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
        configError: "Generated background images are unavailable until GEMINI_API_KEY is configured.",
      },
      planner: {
        provider: "gemini",
        configured: false,
        model: null,
        structuredOutput: true,
        configError: "Natural-language planning is unavailable until GEMINI_API_KEY is configured.",
      },
    },
    controls: {
      draftExecution: {
        mode: "serialized",
        enqueueBlocked: false,
        enqueueReason: null,
        activeJobId: null,
        activeJobStatus: null,
        cancellationState: null,
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
      jobId: "job-plan",
      kind: "site_build_draft",
      status: "completed",
      cancellationState: null,
      createdAt: "2026-03-27T00:00:00.000Z",
      updatedAt: "2026-03-27T00:00:10.000Z",
      latestRun: {
        runNumber: 1,
        status: "completed",
        claimedAt: "2026-03-27T00:00:01.000Z",
        startedAt: "2026-03-27T00:00:02.000Z",
        finishedAt: "2026-03-27T00:00:09.000Z",
        heartbeatAt: "2026-03-27T00:00:09.000Z",
      },
    },
  },
}

const planReadyJob = {
  id: "job-plan",
  kind: "site_build_draft",
  status: "completed",
  requested_by: "user-1",
  payload: {
    prompt:
      "Build a one-page automation consultancy site with a strong hero, FAQ, and a final CTA. Publish now if possible.",
    dryRun: true,
  },
  result: {
    phase3: {
      mode: "plan-only",
      applyRequested: false,
      applyState: "not_applied",
      rollbackSnapshotId: null,
      reviewedSourceJobId: null,
      touchedPageSlugs: ["home"],
      planSummary: {
        pageCount: 1,
        sectionCount: 2,
        themeChangeCount: 1,
        themePresetId: "brand-dark",
        hasThemeSettings: true,
        sectionsByPage: [
          {
            slug: "home",
            title: "Home",
            sectionCount: 2,
            sectionTypes: ["hero_cta", "faq_list"],
          },
        ],
      },
      planner: {
        inputMode: "natural-language",
        provider: "gemini",
        model: "gemini-2.5-flash",
        assumptions: ["Assume a services-led homepage."],
        warnings: ["Publish-now requests are downgraded to draft-only in v1."],
        downgradedRequests: ["publish_now"],
      },
    },
  },
  worker_id: "worker-1",
  claimed_at: "2026-03-27T00:00:01.000Z",
  started_at: "2026-03-27T00:00:02.000Z",
  finished_at: "2026-03-27T00:00:20.000Z",
  cancel_requested_at: null,
  cancel_requested_by: null,
  canceled_at: null,
  canceled_by: null,
  failed_at: null,
  failure_code: null,
  failure_message: null,
  created_at: "2026-03-27T00:00:00.000Z",
  updated_at: "2026-03-27T00:00:20.000Z",
  latestRun: {
    id: "run-plan",
    job_id: "job-plan",
    run_number: 1,
    status: "completed",
    worker_id: "worker-1",
    claimed_at: "2026-03-27T00:00:01.000Z",
    started_at: "2026-03-27T00:00:02.000Z",
    finished_at: "2026-03-27T00:00:20.000Z",
    heartbeat_at: "2026-03-27T00:00:19.000Z",
    canceled_at: null,
    failure_code: null,
    failure_message: null,
    created_at: "2026-03-27T00:00:01.000Z",
    updated_at: "2026-03-27T00:00:20.000Z",
  },
}

const appliedJob = {
  id: "job-apply",
  kind: "site_build_draft",
  status: "completed",
  requested_by: "user-1",
  payload: {
    prompt: planReadyJob.payload.prompt,
    apply: true,
  },
  result: {
    phase3: {
      mode: "apply",
      applyRequested: true,
      applyState: "applied",
      rollbackSnapshotId: "snapshot-1",
      reviewedSourceJobId: "job-plan",
      touchedPageSlugs: ["home", "missing"],
      planSummary: {
        pageCount: 1,
        sectionCount: 2,
        themeChangeCount: 1,
        themePresetId: "brand-dark",
        hasThemeSettings: true,
        sectionsByPage: [
          {
            slug: "home",
            title: "Home",
            sectionCount: 2,
            sectionTypes: ["hero_cta", "faq_list"],
          },
        ],
      },
      planner: {
        inputMode: "natural-language",
        provider: "gemini",
        model: "gemini-2.5-flash",
        assumptions: ["Assume a services-led homepage."],
        warnings: ["Publish-now requests are downgraded to draft-only in v1."],
        downgradedRequests: ["publish_now"],
      },
    },
  },
  worker_id: "worker-1",
  claimed_at: "2026-03-27T00:01:01.000Z",
  started_at: "2026-03-27T00:01:02.000Z",
  finished_at: "2026-03-27T00:01:20.000Z",
  cancel_requested_at: null,
  cancel_requested_by: null,
  canceled_at: null,
  canceled_by: null,
  failed_at: null,
  failure_code: null,
  failure_message: null,
  created_at: "2026-03-27T00:01:00.000Z",
  updated_at: "2026-03-27T00:01:20.000Z",
  latestRun: {
    id: "run-apply",
    job_id: "job-apply",
    run_number: 1,
    status: "completed",
    worker_id: "worker-1",
    claimed_at: "2026-03-27T00:01:01.000Z",
    started_at: "2026-03-27T00:01:02.000Z",
    finished_at: "2026-03-27T00:01:20.000Z",
    heartbeat_at: "2026-03-27T00:01:19.000Z",
    canceled_at: null,
    failure_code: null,
    failure_message: null,
    created_at: "2026-03-27T00:01:01.000Z",
    updated_at: "2026-03-27T00:01:20.000Z",
  },
}

const runningJob = {
  id: "job-running",
  kind: "site_build_draft",
  status: "running",
  requested_by: "user-1",
  payload: {
    prompt: "{\"pages\":[{\"slug\":\"launch\"}]}",
    apply: true,
  },
  result: {
    phase3: {
      mode: "apply",
      applyRequested: true,
      applyState: "applying",
      rollbackSnapshotId: "snapshot-2",
      reviewedSourceJobId: null,
      touchedPageSlugs: ["launch"],
      planSummary: {
        pageCount: 1,
        sectionCount: 1,
        themeChangeCount: 0,
        themePresetId: null,
        hasThemeSettings: false,
        sectionsByPage: [
          {
            slug: "launch",
            title: "Launch",
            sectionCount: 1,
            sectionTypes: ["hero_cta"],
          },
        ],
      },
      planner: {
        inputMode: "json",
        provider: null,
        model: null,
        assumptions: [],
        warnings: [],
        downgradedRequests: [],
      },
    },
  },
  worker_id: "worker-1",
  claimed_at: "2026-03-27T00:02:01.000Z",
  started_at: "2026-03-27T00:02:02.000Z",
  finished_at: null,
  cancel_requested_at: null,
  cancel_requested_by: null,
  canceled_at: null,
  canceled_by: null,
  failed_at: null,
  failure_code: null,
  failure_message: null,
  created_at: "2026-03-27T00:02:00.000Z",
  updated_at: "2026-03-27T00:02:10.000Z",
  latestRun: {
    id: "run-running",
    job_id: "job-running",
    run_number: 1,
    status: "running",
    worker_id: "worker-1",
    claimed_at: "2026-03-27T00:02:01.000Z",
    started_at: "2026-03-27T00:02:02.000Z",
    finished_at: null,
    heartbeat_at: "2026-03-27T00:02:09.000Z",
    canceled_at: null,
    failure_code: null,
    failure_message: null,
    created_at: "2026-03-27T00:02:01.000Z",
    updated_at: "2026-03-27T00:02:10.000Z",
  },
}

const refusedJob = {
  ...planReadyJob,
  id: "job-refused",
  status: "failed",
  result: {},
  failed_at: "2026-03-27T00:03:20.000Z",
  failure_code: "plan_refused",
  failure_message:
    "This brief requests unsupported v1 capabilities: custom_section_schema. Use only existing section types, existing theme controls, and the draft-only review workflow.",
  updated_at: "2026-03-27T00:03:20.000Z",
  latestRun: {
    ...planReadyJob.latestRun,
    id: "run-refused",
    job_id: "job-refused",
    status: "failed",
    finished_at: "2026-03-27T00:03:20.000Z",
    failure_code: "plan_refused",
    failure_message:
      "This brief requests unsupported v1 capabilities: custom_section_schema. Use only existing section types, existing theme controls, and the draft-only review workflow.",
    updated_at: "2026-03-27T00:03:20.000Z",
  },
}

const blockedStatusPayload = {
  status: {
    ...statusPayload.status,
    controls: {
      draftExecution: {
        mode: "serialized",
        enqueueBlocked: true,
        enqueueReason:
          "Draft jobs are serialized on this deployment while job-running is running (not_requested).",
        activeJobId: "job-running",
        activeJobStatus: "running",
        cancellationState: "not_requested",
      },
    },
  },
}

const listPayload = {
  jobs: [planReadyJob, appliedJob, runningJob],
}

const detailPayloads: Record<string, unknown> = {
  "job-plan": {
    job: planReadyJob,
    runs: [planReadyJob.latestRun],
    logs: [
      {
        id: 1,
        job_id: "job-plan",
        run_id: "run-plan",
        level: "info",
        message: "Built plan for home",
        created_at: "2026-03-27T00:00:03.000Z",
      },
    ],
  },
  "job-apply": {
    job: appliedJob,
    runs: [appliedJob.latestRun],
    logs: [
      {
        id: 2,
        job_id: "job-apply",
        run_id: "run-apply",
        level: "info",
        message: "Applied reviewed plan to home",
        created_at: "2026-03-27T00:01:03.000Z",
      },
    ],
  },
  "job-running": {
    job: runningJob,
    runs: [runningJob.latestRun],
    logs: [
      {
        id: 3,
        job_id: "job-running",
        run_id: "run-running",
        level: "info",
        message: "Building launch page",
        created_at: "2026-03-27T00:02:03.000Z",
      },
    ],
  },
  "job-refused": {
    job: refusedJob,
    runs: [refusedJob.latestRun],
    logs: [
      {
        id: 4,
        job_id: "job-refused",
        run_id: "run-refused",
        level: "error",
        message: "Planner request refused for unsupported v1 scope.",
        created_at: "2026-03-27T00:03:03.000Z",
      },
    ],
  },
}

describe("AgentWorkspacePageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("renders loading and then the review-first workspace surfaces", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes("/admin/api/agent/status")) return Promise.resolve(jsonResponse({ ok: true, body: statusPayload }))
        if (url.includes("/admin/api/pages/overview")) {
          return Promise.resolve(
            jsonResponse({
              ok: true,
              body: { pages: [{ id: "page-home", slug: "home", title: "Home" }] },
            })
          )
        }
        if (url.includes("/admin/api/agent/jobs/job-plan")) {
          return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-plan"] }))
        }
        if (url.includes("/admin/api/agent/jobs?limit=50")) {
          return Promise.resolve(jsonResponse({ ok: true, body: listPayload }))
        }
        throw new Error(`Unexpected fetch: ${url}`)
      }) as typeof fetch
    )

    render(<AgentWorkspacePageClient />)

    expect(screen.getByText(/loading agent status/i)).toBeInTheDocument()
    expect(await screen.findByText(/runtime: local-worker/i)).toBeInTheDocument()
    expect(screen.getByText(/worker service: hopfner-agent-worker.service · not installed/i)).toBeInTheDocument()
    expect(screen.getByText(/worker offline/i)).toBeInTheDocument()
    expect(screen.getByText(/planner: gemini · not configured/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^plan only$/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /^create draft$/i })).toBeDisabled()
    expect(screen.getByText(/draft-only workflow/i)).toBeInTheDocument()
    expect(screen.getAllByText(/natural-language planning is unavailable until gemini_api_key is configured/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: /site_build_draft · completed/i })).toHaveLength(2)
    expect(await screen.findByText(/built plan for home/i)).toBeInTheDocument()
    expect(screen.getByText(/pages: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/sections: 2/i)).toBeInTheDocument()
    expect(screen.getByText(/theme preset: brand-dark/i)).toBeInTheDocument()
    expect(screen.getByText(/theme settings: included/i)).toBeInTheDocument()
    expect(screen.getByText(/home \(home\) · 2 sections/i)).toBeInTheDocument()
    expect(screen.getByText(/hero_cta, faq_list/i)).toBeInTheDocument()
    expect(screen.getAllByText(/input mode: natural language/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/provider: gemini/i)).toBeInTheDocument()
    expect(screen.getByText(/model: gemini-2.5-flash/i)).toBeInTheDocument()
    expect(screen.getByText(/assume a services-led homepage/i)).toBeInTheDocument()
    expect(screen.getByText(/publish-now requests are downgraded to draft-only in v1/i)).toBeInTheDocument()
    expect(screen.getByText(/publish_now/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /apply reviewed plan/i })).toBeEnabled()
  })

  it("renders serialized busy-state messaging when another draft job is active", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes("/admin/api/agent/status")) return Promise.resolve(jsonResponse({ ok: true, body: blockedStatusPayload }))
        if (url.includes("/admin/api/pages/overview")) {
          return Promise.resolve(jsonResponse({ ok: true, body: { pages: [] } }))
        }
        if (url.includes("/admin/api/agent/jobs/job-plan")) {
          return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-plan"] }))
        }
        if (url.includes("/admin/api/agent/jobs?limit=50")) {
          return Promise.resolve(jsonResponse({ ok: true, body: listPayload }))
        }
        throw new Error(`Unexpected fetch: ${url}`)
      }) as typeof fetch
    )

    render(<AgentWorkspacePageClient />)

    expect((await screen.findAllByText(/draft jobs are serialized on this deployment while job-running is running/i)).length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: /^plan only$/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /^create draft$/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /apply reviewed plan/i })).toBeDisabled()
  })

  it("submits explicit plan-only and create-draft payloads from the job form", async () => {
    let nextJobId = 0
    const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit | undefined) => {
      const url = String(input)
      if (url.includes("/admin/api/agent/status")) return Promise.resolve(jsonResponse({ ok: true, body: statusPayload }))
      if (url.includes("/admin/api/pages/overview")) return Promise.resolve(jsonResponse({ ok: true, body: { pages: [] } }))
      if (url.includes("/admin/api/agent/jobs?limit=50")) return Promise.resolve(jsonResponse({ ok: true, body: { jobs: [] } }))
      if (url.endsWith("/admin/api/agent/jobs") && init?.method === "POST") {
        nextJobId += 1
        return Promise.resolve(
          jsonResponse({
            ok: true,
            status: 201,
            body: {
              job: {
                id: `job-new-${nextJobId}`,
              },
            },
          })
        )
      }
      if (url.includes("/admin/api/agent/jobs/job-new-1")) {
        return Promise.resolve(
          jsonResponse({
            ok: true,
            body: {
              job: {
                ...planReadyJob,
                id: "job-new-1",
              },
              runs: [],
              logs: [],
            },
          })
        )
      }
      if (url.includes("/admin/api/agent/jobs/job-new-2")) {
        return Promise.resolve(
          jsonResponse({
            ok: true,
            body: {
              job: {
                ...appliedJob,
                id: "job-new-2",
              },
              runs: [],
              logs: [],
            },
          })
        )
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })
    vi.stubGlobal("fetch", fetchMock as typeof fetch)

    render(<AgentWorkspacePageClient />)

    const textarea = await screen.findByLabelText(/website brief or json prompt/i)
    expect(String((textarea as HTMLTextAreaElement).value)).toContain(
      "Build a one-page marketing site for a workflow automation consultancy."
    )

    fireEvent.change(textarea, { target: { value: '{"pages":[{"slug":"launch"}]}' } })
    await userEvent.click(screen.getByRole("button", { name: /^plan only$/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/admin/api/agent/jobs",
        expect.objectContaining({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind: "site_build_draft",
            payload: {
              prompt: '{"pages":[{"slug":"launch"}]}',
              dryRun: true,
            },
          }),
        })
      )
    })

    fireEvent.change(textarea, { target: { value: '{"pages":[{"slug":"launch"}]}' } })
    await userEvent.click(screen.getByRole("button", { name: /^create draft$/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/admin/api/agent/jobs",
        expect.objectContaining({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind: "site_build_draft",
            payload: {
              prompt: '{"pages":[{"slug":"launch"}]}',
              apply: true,
            },
          }),
        })
      )
    })
  })

  it("applies a reviewed stored plan through the dedicated backend route", async () => {
    let jobsPayload = listPayload
    const reviewedApplyJob = {
      ...appliedJob,
      id: "job-reviewed-apply",
      result: {
        phase3: {
          ...appliedJob.result.phase3,
          reviewedSourceJobId: "job-plan",
        },
      },
    }

    const fetchMock = vi.fn((input: RequestInfo | URL, _init?: RequestInit) => {
      void _init
      const url = String(input)
      if (url.includes("/admin/api/agent/status")) return Promise.resolve(jsonResponse({ ok: true, body: statusPayload }))
      if (url.includes("/admin/api/pages/overview")) return Promise.resolve(jsonResponse({ ok: true, body: { pages: [] } }))
      if (url.includes("/admin/api/agent/jobs?limit=50")) return Promise.resolve(jsonResponse({ ok: true, body: jobsPayload }))
      if (url.includes("/admin/api/agent/jobs/job-plan") && !url.endsWith("/apply-reviewed")) {
        return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-plan"] }))
      }
      if (url.endsWith("/admin/api/agent/jobs/job-plan/apply-reviewed")) {
        jobsPayload = {
          jobs: [reviewedApplyJob, ...listPayload.jobs],
        }
        return Promise.resolve(
          jsonResponse({
            ok: true,
            status: 201,
            body: {
              ok: true,
              sourceJobId: "job-plan",
              job: reviewedApplyJob,
            },
          })
        )
      }
      if (url.includes("/admin/api/agent/jobs/job-reviewed-apply")) {
        return Promise.resolve(
          jsonResponse({
            ok: true,
            body: {
              job: reviewedApplyJob,
              runs: [],
              logs: [],
            },
          })
        )
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })
    vi.stubGlobal("fetch", fetchMock as typeof fetch)

    render(<AgentWorkspacePageClient />)

    await userEvent.click(await screen.findByRole("button", { name: /apply reviewed plan/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/admin/api/agent/jobs/job-plan/apply-reviewed",
        expect.objectContaining({ method: "POST" })
      )
    })

    expect(fetchMock).not.toHaveBeenCalledWith(
      "/admin/api/agent/jobs",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("reviewedSourceJobId"),
      })
    )
    expect(
      await screen.findByText(/stored canonical plan will be applied without rerunning the planner/i)
    ).toBeInTheDocument()
  })

  it("renders touched-page visual-editor links and reviewed source messaging for applied jobs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes("/admin/api/agent/status")) return Promise.resolve(jsonResponse({ ok: true, body: statusPayload }))
        if (url.includes("/admin/api/pages/overview")) {
          return Promise.resolve(
            jsonResponse({
              ok: true,
              body: { pages: [{ id: "page-home", slug: "home", title: "Home" }] },
            })
          )
        }
        if (url.includes("/admin/api/agent/jobs/job-plan")) return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-plan"] }))
        if (url.includes("/admin/api/agent/jobs/job-apply")) return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-apply"] }))
        if (url.includes("/admin/api/agent/jobs?limit=50")) return Promise.resolve(jsonResponse({ ok: true, body: listPayload }))
        throw new Error(`Unexpected fetch: ${url}`)
      }) as typeof fetch
    )

    render(<AgentWorkspacePageClient />)

    await userEvent.click((await screen.findAllByRole("button", { name: /site_build_draft · completed/i }))[1])

    const homeLink = await screen.findByRole("link", { name: "home" })
    expect(homeLink).toHaveAttribute("href", "/admin/pages/page-home/visual")
    expect(screen.getByText(/missing \(unresolved\)/i)).toBeInTheDocument()
    expect(screen.getByText(/this draft job was applied from reviewed plan job job-plan/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^rollback$/i })).toBeEnabled()
    })
    expect(screen.getByRole("button", { name: /apply reviewed plan/i })).toBeDisabled()
  })

  it("does not keep previous job detail active while a newly selected job detail is still loading", async () => {
    const delayedRunningDetail = deferredResponse()

    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes("/admin/api/agent/status")) return Promise.resolve(jsonResponse({ ok: true, body: statusPayload }))
        if (url.includes("/admin/api/pages/overview")) return Promise.resolve(jsonResponse({ ok: true, body: { pages: [] } }))
        if (url.includes("/admin/api/agent/jobs?limit=50")) return Promise.resolve(jsonResponse({ ok: true, body: listPayload }))
        if (url.includes("/admin/api/agent/jobs/job-plan")) {
          return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-plan"] }))
        }
        if (url.includes("/admin/api/agent/jobs/job-running")) {
          return delayedRunningDetail.promise
        }
        throw new Error(`Unexpected fetch: ${url}`)
      }) as typeof fetch
    )

    render(<AgentWorkspacePageClient />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /apply reviewed plan/i })).toBeEnabled()
      expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled()
    })

    await userEvent.click(screen.getByRole("button", { name: /site_build_draft · running/i }))

    expect(await screen.findByText(/loading job detail/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /apply reviewed plan/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /^rollback$/i })).toBeDisabled()

    await act(async () => {
      delayedRunningDetail.resolve(
        jsonResponse({
          ok: true,
          body: detailPayloads["job-running"],
        })
      )
    })

    expect(await screen.findByText(/building launch page/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /apply reviewed plan/i })).toBeDisabled()
  })

  it("wires reviewed apply, rollback, and cancel actions to the approved APIs based on job eligibility", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, _init?: RequestInit) => {
      void _init
      const url = String(input)
      if (url.includes("/admin/api/agent/status")) return Promise.resolve(jsonResponse({ ok: true, body: statusPayload }))
      if (url.includes("/admin/api/pages/overview")) return Promise.resolve(jsonResponse({ ok: true, body: { pages: [] } }))
      if (url.includes("/admin/api/agent/jobs?limit=50")) return Promise.resolve(jsonResponse({ ok: true, body: listPayload }))
      if (url.includes("/admin/api/agent/jobs/job-plan") && !url.endsWith("/apply-reviewed")) {
        return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-plan"] }))
      }
      if (url.includes("/admin/api/agent/jobs/job-apply") && !url.endsWith("/rollback")) {
        return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-apply"] }))
      }
      if (url.endsWith("/admin/api/agent/jobs/job-apply/rollback")) {
        return Promise.resolve(jsonResponse({ ok: true, body: { ok: true, snapshotId: "snapshot-1" } }))
      }
      if (url.includes("/admin/api/agent/jobs/job-running") && !url.endsWith("/cancel")) {
        return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-running"] }))
      }
      if (url.endsWith("/admin/api/agent/jobs/job-running/cancel")) {
        return Promise.resolve(jsonResponse({ ok: true, body: { ok: true } }))
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })
    vi.stubGlobal("fetch", fetchMock as typeof fetch)

    render(<AgentWorkspacePageClient />)

    await userEvent.click((await screen.findAllByRole("button", { name: /site_build_draft · completed/i }))[1])

    await waitFor(() => {
      expect(screen.getByText(/this draft job was applied from reviewed plan job job-plan/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /^rollback$/i })).toBeEnabled()
      expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled()
    })

    await userEvent.click(screen.getByRole("button", { name: /^rollback$/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/admin/api/agent/jobs/job-apply/rollback",
        expect.objectContaining({ method: "POST" })
      )
    })

    await userEvent.click(screen.getByRole("button", { name: /site_build_draft · running/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^cancel$/i })).toBeEnabled()
      expect(screen.getByRole("button", { name: /^rollback$/i })).toBeDisabled()
      expect(screen.getByRole("button", { name: /apply reviewed plan/i })).toBeDisabled()
    })

    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/admin/api/agent/jobs/job-running/cancel",
        expect.objectContaining({ method: "POST" })
      )
    })
  }, 15_000)

  it("renders refusal failures with operator-readable scope messaging in job detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes("/admin/api/agent/status")) return Promise.resolve(jsonResponse({ ok: true, body: statusPayload }))
        if (url.includes("/admin/api/pages/overview")) {
          return Promise.resolve(jsonResponse({ ok: true, body: { pages: [] } }))
        }
        if (url.includes("/admin/api/agent/jobs/job-refused")) {
          return Promise.resolve(jsonResponse({ ok: true, body: detailPayloads["job-refused"] }))
        }
        if (url.includes("/admin/api/agent/jobs?limit=50")) {
          return Promise.resolve(jsonResponse({ ok: true, body: { jobs: [refusedJob] } }))
        }
        throw new Error(`Unexpected fetch: ${url}`)
      }) as typeof fetch
    )

    render(<AgentWorkspacePageClient />)

    expect(await screen.findByText(/the request was refused because it exceeds v1 scope/i)).toBeInTheDocument()
    expect(screen.getByText(/no draft changes were applied/i)).toBeInTheDocument()
  })

  it("renders explicit error and empty states from the shared admin scaffolds", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes("/admin/api/agent/status")) {
        return Promise.resolve(jsonResponse({ ok: false, status: 500, body: { error: "status exploded" } }))
      }
      if (url.includes("/admin/api/pages/overview")) {
        return Promise.resolve(jsonResponse({ ok: true, body: { pages: [] } }))
      }
      if (url.includes("/admin/api/agent/jobs?limit=50")) {
        return Promise.resolve(jsonResponse({ ok: true, body: { jobs: [] } }))
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })
    vi.stubGlobal("fetch", fetchMock as typeof fetch)

    render(<AgentWorkspacePageClient />)

    expect(await screen.findByText(/status exploded/i)).toBeInTheDocument()
    expect(screen.getByText(/no agent jobs yet/i)).toBeInTheDocument()
    expect(screen.getByText(/select an agent job/i)).toBeInTheDocument()
  })

  it("keeps the empty jobs and empty detail states stable during background polling", async () => {
    let pollCallback: (() => void) | null = null
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes("/admin/api/agent/status")) {
        return Promise.resolve(jsonResponse({ ok: true, body: statusPayload }))
      }
      if (url.includes("/admin/api/pages/overview")) {
        return Promise.resolve(jsonResponse({ ok: true, body: { pages: [] } }))
      }
      if (url.includes("/admin/api/agent/jobs?limit=50")) {
        return Promise.resolve(jsonResponse({ ok: true, body: { jobs: [] } }))
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    vi.spyOn(window, "setInterval").mockImplementation(((callback: TimerHandler) => {
      pollCallback = callback as () => void
      return 1 as unknown as ReturnType<typeof setInterval>
    }) as typeof window.setInterval)
    vi.spyOn(window, "clearInterval").mockImplementation(() => {})
    vi.stubGlobal("fetch", fetchMock as typeof fetch)

    render(<AgentWorkspacePageClient />)

    expect(await screen.findByText(/no agent jobs yet/i)).toBeInTheDocument()
    expect(screen.getByText(/select an agent job/i)).toBeInTheDocument()
    expect(screen.queryByText(/loading jobs/i)).not.toBeInTheDocument()

    await act(async () => {
      pollCallback?.()
    })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/admin/api/agent/jobs?limit=50")
    })

    expect(screen.getByText(/no agent jobs yet/i)).toBeInTheDocument()
    expect(screen.getByText(/select an agent job/i)).toBeInTheDocument()
    expect(screen.queryByText(/loading jobs/i)).not.toBeInTheDocument()
  })
})
