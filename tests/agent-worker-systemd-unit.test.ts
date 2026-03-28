import path from "node:path"

import { describe, expect, it } from "vitest"
import workerSystemdRenderer from "../scripts/render-agent-worker-systemd-unit.cjs"

const {
  DEFAULT_GROUP,
  DEFAULT_SERVICE_NAME,
  DEFAULT_USER,
  buildAgentWorkerSystemdUnit,
} = workerSystemdRenderer as {
  DEFAULT_GROUP: string
  DEFAULT_SERVICE_NAME: string
  DEFAULT_USER: string
  buildAgentWorkerSystemdUnit: (input?: {
    appDir?: string
    serviceName?: string
    user?: string
    group?: string
    runScript?: string
  }) => string
}

describe("agent worker systemd unit renderer", () => {
  it("renders the expected default unit", () => {
    const appDir = "/var/www/html/hopfner.dev-main"

    expect(buildAgentWorkerSystemdUnit({ appDir })).toBe(`[Unit]\nDescription=${DEFAULT_SERVICE_NAME} (Hopfner agent worker)\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=simple\nWorkingDirectory=${appDir}\nExecStart=${path.join(appDir, "scripts/run-agent-worker-service.sh")}\nRestart=always\nRestartSec=2\nTimeoutStopSec=15\nUser=${DEFAULT_USER}\nGroup=${DEFAULT_GROUP}\nNoNewPrivileges=true\n\n[Install]\nWantedBy=multi-user.target\n`)
  })

  it("supports custom install parameters", () => {
    const rendered = buildAgentWorkerSystemdUnit({
      appDir: "/srv/app",
      serviceName: "custom-worker.service",
      user: "deploy",
      group: "deploy",
      runScript: "/srv/app/scripts/run-worker.sh",
    })

    expect(rendered).toContain("Description=custom-worker.service (Hopfner agent worker)")
    expect(rendered).toContain("WorkingDirectory=/srv/app")
    expect(rendered).toContain("ExecStart=/srv/app/scripts/run-worker.sh")
    expect(rendered).toContain("User=deploy")
    expect(rendered).toContain("Group=deploy")
  })
})
