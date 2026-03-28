import { describe, expect, it } from "vitest"

import { AgentWorkerConfigError } from "@/lib/agent/jobs/errors"
import { parseAgentWorkerArgs, parseAgentWorkerConfig } from "@/lib/agent/jobs/worker-config"

describe("agent worker config", () => {
  it("parses one-shot mode and worker-id overrides from argv", () => {
    expect(parseAgentWorkerArgs(["--once", "--worker-id", "worker-a"])).toEqual({
      once: true,
      validateOnly: false,
      workerId: "worker-a",
    })

    expect(parseAgentWorkerArgs(["--check", "--worker-id=worker-b"])).toEqual({
      once: false,
      validateOnly: true,
      workerId: "worker-b",
    })
  })

  it("uses env defaults and validates timing constraints", () => {
    const config = parseAgentWorkerConfig(
      {
        AGENT_WORKER_ID: "worker-env",
        AGENT_WORKER_POLL_INTERVAL_MS: "1500",
        AGENT_WORKER_STALE_AFTER_MS: "15000",
      },
      []
    )

    expect(config).toEqual({
      once: false,
      validateOnly: false,
      workerId: "worker-env",
      pollIntervalMs: 1500,
      staleAfterMs: 15000,
    })

    expect(() =>
      parseAgentWorkerConfig(
        {
          AGENT_WORKER_ID: "worker-env",
          AGENT_WORKER_POLL_INTERVAL_MS: "5000",
          AGENT_WORKER_STALE_AFTER_MS: "5000",
        },
        []
      )
    ).toThrow(AgentWorkerConfigError)
  })

  it("rejects unsupported CLI arguments", () => {
    expect(() => parseAgentWorkerArgs(["--bad-flag"])).toThrow(AgentWorkerConfigError)
  })
})
