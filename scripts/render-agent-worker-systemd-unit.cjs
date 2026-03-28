const path = require("node:path")

const DEFAULT_SERVICE_NAME = "hopfner-agent-worker.service"
const DEFAULT_USER = "www-data"
const DEFAULT_GROUP = "www-data"

function buildAgentWorkerSystemdUnit(options = {}) {
  const appDir = options.appDir || path.resolve(__dirname, "..")
  const serviceName = options.serviceName || DEFAULT_SERVICE_NAME
  const user = options.user || DEFAULT_USER
  const group = options.group || DEFAULT_GROUP
  const runScript = options.runScript || path.join(appDir, "scripts/run-agent-worker-service.sh")

  return `[Unit]
Description=${serviceName} (Hopfner agent worker)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${appDir}
ExecStart=${runScript}
Restart=always
RestartSec=2
TimeoutStopSec=15
User=${user}
Group=${group}
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
`
}

if (require.main === module) {
  process.stdout.write(
    buildAgentWorkerSystemdUnit({
      appDir: process.env.APP_DIR,
      serviceName: process.env.SERVICE_NAME,
      user: process.env.SERVICE_USER,
      group: process.env.SERVICE_GROUP,
      runScript: process.env.RUN_SCRIPT,
    })
  )
}

module.exports = {
  DEFAULT_GROUP,
  DEFAULT_SERVICE_NAME,
  DEFAULT_USER,
  buildAgentWorkerSystemdUnit,
}
