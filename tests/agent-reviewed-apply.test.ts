import { describe, expect, it, vi } from "vitest"

import { AgentJobValidationError } from "@/lib/agent/jobs/errors"
import {
  assertNoReviewedPlanApplyPayload,
  buildReviewedPlanApplyPayload,
  isReviewedPlanApplyPayload,
} from "@/lib/agent/execution/reviewed-apply"

vi.mock("server-only", () => ({}))

function createSourceJob(overrides?: {
  status?: string
  phase3?: Record<string, unknown>
}) {
  return {
    id: "job-plan-1",
    kind: "site_build_draft" as const,
    status: overrides?.status ?? "completed",
    requested_by: "user-1",
    payload: {
      prompt: "Build a one-page consultancy site.",
    },
    result: {
      phase3: {
        mode: "plan-only",
        applyRequested: false,
        applyState: "not_applied",
        idempotencyKey: "plan-key-1",
        promptHash: "prompt-hash-1",
        touchedPageSlugs: ["home"],
        rollbackSnapshotId: null,
        snapshotStatus: "not_captured",
        planSummary: {
          pageCount: 1,
          sectionCount: 1,
          touchedPageSlugs: ["home"],
          themePresetId: null,
          hasThemeSettings: false,
          sectionsByPage: [],
        },
        plan: {
          version: "phase3.v1",
          autoPublish: false,
          pages: [
            {
              slug: "home",
              title: "Home",
              sections: [
                {
                  order: 0,
                  sectionType: "hero_cta",
                  key: null,
                  enabled: true,
                  draft: {
                    meta: {
                      title: "",
                      subtitle: "",
                      ctaPrimaryLabel: "",
                      ctaPrimaryHref: "",
                      ctaSecondaryLabel: "",
                      ctaSecondaryHref: "",
                      backgroundMediaUrl: "",
                    },
                    formatting: {},
                    content: {},
                  },
                  media: null,
                },
              ],
            },
          ],
          theme: null,
        },
        planner: {
          inputMode: "natural-language",
          provider: "gemini",
          model: "gemini-2.5-flash",
          assumptions: ["Assume a services-led homepage."],
          warnings: [],
          downgradedRequests: [],
        },
        reviewedSourceJobId: null,
        ...(overrides?.phase3 ?? {}),
      },
    },
    worker_id: null,
    claimed_at: null,
    started_at: null,
    finished_at: "2026-03-28T00:00:05.000Z",
    cancel_requested_at: null,
    cancel_requested_by: null,
    canceled_at: null,
    canceled_by: null,
    failed_at: null,
    failure_code: null,
    failure_message: null,
    created_at: "2026-03-28T00:00:00.000Z",
    updated_at: "2026-03-28T00:00:05.000Z",
  }
}

describe("reviewed-plan apply payload", () => {
  it("detects reviewed-plan apply payload markers", () => {
    expect(
      isReviewedPlanApplyPayload({
        prompt: "Apply the reviewed plan.",
        apply: true,
        reviewedSourceJobId: "job-plan-1",
      })
    ).toBe(true)
    expect(isReviewedPlanApplyPayload({ prompt: "Build a one-page consultancy site." })).toBe(
      false
    )
  })

  it("rejects reviewed-plan apply payloads outside the dedicated route", () => {
    expect(() =>
      assertNoReviewedPlanApplyPayload({
        prompt: "Apply the reviewed plan.",
        apply: true,
        reviewedPlan: { version: "phase3.v1" },
      })
    ).toThrow(
      new AgentJobValidationError(
        "Reviewed-plan apply jobs must be created through /admin/api/agent/jobs/[jobId]/apply-reviewed."
      )
    )
  })

  it("builds an audited apply payload from a completed plan-only source job", () => {
    const payload = buildReviewedPlanApplyPayload(createSourceJob())

    expect(payload).toMatchObject({
      prompt: "Build a one-page consultancy site.",
      apply: true,
      reviewedSourceJobId: "job-plan-1",
      reviewedSourcePromptHash: "prompt-hash-1",
      reviewedSourceIdempotencyKey: "plan-key-1",
    })
    expect(payload.reviewedPlan).toMatchObject({
      version: "phase3.v1",
      autoPublish: false,
    })
    expect(payload.reviewedPlanner).toEqual({
      inputMode: "natural-language",
      provider: "gemini",
      model: "gemini-2.5-flash",
      assumptions: ["Assume a services-led homepage."],
      warnings: [],
      downgradedRequests: [],
    })
  })

  it("creates a reviewed-plan apply job through the dedicated service path", async () => {
    const sourceJob = createSourceJob()
    const enqueuedJob = {
      id: "job-apply-1",
      kind: "site_build_draft" as const,
      status: "queued" as const,
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
      created_at: "2026-03-28T00:00:06.000Z",
      updated_at: "2026-03-28T00:00:06.000Z",
    }

    const maybeSingleSource = vi.fn().mockResolvedValue({ data: sourceJob, error: null })
    const eqSource = vi.fn().mockReturnValue({
      maybeSingle: maybeSingleSource,
    })
    const selectSource = vi.fn().mockReturnValue({
      eq: eqSource,
    })

    const maybeSingleConflict = vi.fn().mockResolvedValue({ data: null, error: null })
    const limitConflict = vi.fn().mockReturnValue({
      maybeSingle: maybeSingleConflict,
    })
    const orderConflict = vi.fn().mockReturnValue({
      limit: limitConflict,
    })
    const inConflict = vi.fn().mockReturnValue({
      order: orderConflict,
    })
    const eqConflictKind = vi.fn().mockReturnValue({
      in: inConflict,
    })
    const selectConflict = vi.fn().mockReturnValue({
      eq: eqConflictKind,
    })

    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: selectSource,
      })
      .mockReturnValueOnce({
        select: selectConflict,
      })
    const rpc = vi.fn().mockResolvedValue({ data: enqueuedJob, error: null })

    const supabase = {
      from,
      rpc,
    }

    const { createReviewedPlanApplyJob } = await import("@/lib/agent/jobs/service")
    const job = await createReviewedPlanApplyJob(supabase as never, {
      sourceJobId: "job-plan-1",
      requestedBy: "user-1",
    })

    expect(from).toHaveBeenNthCalledWith(1, "agent_jobs")
    expect(eqSource).toHaveBeenCalledWith("id", "job-plan-1")
    expect(from).toHaveBeenNthCalledWith(2, "agent_jobs")
    expect(eqConflictKind).toHaveBeenCalledWith("kind", "site_build_draft")
    expect(rpc).toHaveBeenCalledWith("agent_enqueue_job", {
      p_kind: "site_build_draft",
      p_payload: {
        prompt: "Build a one-page consultancy site.",
        apply: true,
        reviewedSourceJobId: "job-plan-1",
        reviewedSourcePromptHash: "prompt-hash-1",
        reviewedSourceIdempotencyKey: "plan-key-1",
        reviewedPlan: sourceJob.result.phase3.plan,
        reviewedPlanner: sourceJob.result.phase3.planner,
      },
      p_requested_by: "user-1",
    })
    expect(job).toMatchObject({
      id: "job-apply-1",
      kind: "site_build_draft",
      status: "queued",
    })
  })

  it("rejects source jobs that are not completed plan-only draft jobs", () => {
    expect(() =>
      buildReviewedPlanApplyPayload(
        createSourceJob({
          phase3: {
            mode: "apply",
            applyRequested: true,
            applyState: "applied",
            rollbackSnapshotId: "snapshot-1",
            snapshotStatus: "captured",
          },
        })
      )
    ).toThrow(AgentJobValidationError)
  })
})
