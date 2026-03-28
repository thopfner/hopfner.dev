import { describe, expect, it } from "vitest"

import {
  assertAgentJobKind,
  isSerializedAgentJobKind,
  isTerminalAgentJobStatus,
  normalizeAgentJobPayload,
  resolveAgentJobCancellationState,
  resolveAgentJobCancelTransition,
  resolveAgentJobRecoveryAction,
} from "@/lib/agent/jobs/lifecycle"
import { AgentJobValidationError } from "@/lib/agent/jobs/errors"

describe("agent job lifecycle helpers", () => {
  it("accepts the supported worker job kinds", () => {
    expect(assertAgentJobKind("site_build_noop")).toBe("site_build_noop")
    expect(assertAgentJobKind("site_build_draft")).toBe("site_build_draft")
  })

  it("rejects unsupported job kinds", () => {
    expect(() => assertAgentJobKind("real_site_build")).toThrow(AgentJobValidationError)
  })

  it("serializes draft builds but not noop jobs", () => {
    expect(isSerializedAgentJobKind("site_build_draft")).toBe(true)
    expect(isSerializedAgentJobKind("site_build_noop")).toBe(false)
  })

  it("normalizes missing payload to an empty object", () => {
    expect(normalizeAgentJobPayload(undefined)).toEqual({})
    expect(normalizeAgentJobPayload(null)).toEqual({})
  })

  it("rejects non-object payloads", () => {
    expect(() => normalizeAgentJobPayload(["bad"])).toThrow(AgentJobValidationError)
    expect(() => normalizeAgentJobPayload("bad")).toThrow(AgentJobValidationError)
  })

  it("marks queued jobs as immediately cancelable", () => {
    expect(
      resolveAgentJobCancelTransition({
        status: "queued",
        cancel_requested_at: null,
      })
    ).toBe("canceled")
  })

  it("marks claimed or running jobs as cancel-requested", () => {
    expect(
      resolveAgentJobCancelTransition({
        status: "claimed",
        cancel_requested_at: null,
      })
    ).toBe("cancel_requested")

    expect(
      resolveAgentJobCancelTransition({
        status: "running",
        cancel_requested_at: null,
      })
    ).toBe("cancel_requested")
  })

  it("treats repeated running-job cancels as already requested", () => {
    expect(
      resolveAgentJobCancelTransition({
        status: "running",
        cancel_requested_at: "2026-03-27T00:00:00.000Z",
      })
    ).toBe("already_requested")
  })

  it("exposes explicit cancellation state for operators", () => {
    expect(
      resolveAgentJobCancellationState({
        status: "running",
        cancel_requested_at: null,
      })
    ).toBe("not_requested")

    expect(
      resolveAgentJobCancellationState({
        status: "running",
        cancel_requested_at: "2026-03-27T00:00:00.000Z",
      })
    ).toBe("cancel_requested")

    expect(
      resolveAgentJobCancellationState({
        status: "canceled",
        cancel_requested_at: "2026-03-27T00:00:00.000Z",
      })
    ).toBe("canceled")

    expect(
      resolveAgentJobCancellationState({
        status: "completed",
        cancel_requested_at: null,
      })
    ).toBe("not_cancellable")
  })

  it("requeues stale jobs unless cancellation was already requested", () => {
    expect(resolveAgentJobRecoveryAction({ cancel_requested_at: null })).toBe("requeued")
    expect(
      resolveAgentJobRecoveryAction({
        cancel_requested_at: "2026-03-27T00:00:00.000Z",
      })
    ).toBe("canceled")
  })

  it("treats terminal jobs as already finished", () => {
    expect(
      resolveAgentJobCancelTransition({
        status: "completed",
        cancel_requested_at: null,
      })
    ).toBe("already_finished")

    expect(isTerminalAgentJobStatus("failed")).toBe(true)
    expect(isTerminalAgentJobStatus("canceled")).toBe(true)
    expect(isTerminalAgentJobStatus("running")).toBe(false)
  })
})
