import { NextResponse } from "next/server"

import { resolveAgentJobCancellationState } from "@/lib/agent/jobs/lifecycle"
import { findActiveAgentJobConflict, listAgentJobs } from "@/lib/agent/jobs/service"
import { parseAgentWorkerConfig } from "@/lib/agent/jobs/worker-config"
import {
  readAgentWorkerLivenessStatus,
  readAgentWorkerProviderStatus,
} from "@/lib/agent/jobs/worker-service"
import { AGENT_WORKER_RETRY_POLICY, AGENT_WORKER_V1_SCOPE } from "@/lib/agent/jobs/worker-runtime"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

function buildDraftExecutionEnqueueReason(activeDraftJob: {
  jobId: string
  status: string
  cancellationState: string
} | null): string | null {
  if (!activeDraftJob) return null
  return `Draft jobs are serialized on this deployment while ${activeDraftJob.jobId} is ${activeDraftJob.status} (${activeDraftJob.cancellationState}).`
}

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const supabase = getSupabaseAdmin()
    const jobs = await listAgentJobs(supabase, { limit: 1 })
    const activeDraftJob = await findActiveAgentJobConflict(supabase, "site_build_draft")
    const providers = readAgentWorkerProviderStatus(process.env)

    let worker:
      | {
          configured: true
          serviceName: string
          serviceInstalled: boolean
          online: boolean
          stale: boolean
          lastHeartbeatAt: string | null
          workerId: string | null
          startedAt: string | null
          pollIntervalMs: number
          staleAfterMs: number
          configError: null
        }
      | {
          configured: false
          serviceName: string
          serviceInstalled: boolean
          online: boolean
          stale: boolean
          lastHeartbeatAt: string | null
          workerId: string | null
          startedAt: string | null
          pollIntervalMs: null
          staleAfterMs: null
          configError: string
        }

    try {
      const config = parseAgentWorkerConfig(process.env, [])
      const liveness = await readAgentWorkerLivenessStatus({
        staleAfterMs: config.staleAfterMs,
      })
      worker = {
        configured: true,
        serviceName: liveness.serviceName,
        serviceInstalled: liveness.serviceInstalled,
        online: liveness.online,
        stale: liveness.stale,
        lastHeartbeatAt: liveness.lastHeartbeatAt,
        workerId: liveness.workerId,
        startedAt: liveness.startedAt,
        pollIntervalMs: config.pollIntervalMs,
        staleAfterMs: config.staleAfterMs,
        configError: null,
      }
    } catch (error) {
      const liveness = await readAgentWorkerLivenessStatus()
      worker = {
        configured: false,
        serviceName: liveness.serviceName,
        serviceInstalled: liveness.serviceInstalled,
        online: liveness.online,
        stale: liveness.stale,
        lastHeartbeatAt: liveness.lastHeartbeatAt,
        workerId: liveness.workerId,
        startedAt: liveness.startedAt,
        pollIntervalMs: null,
        staleAfterMs: null,
        configError: error instanceof Error ? error.message : "Worker config is invalid.",
      }
    }

    const latestJob = jobs[0] ?? null

    return NextResponse.json({
      status: {
        runtime: "local-worker",
        supportedJobKinds: ["site_build_noop", "site_build_draft"],
        rollbackSupported: true,
        worker,
        providers,
        controls: {
          draftExecution: {
            mode: "serialized",
            enqueueBlocked: Boolean(activeDraftJob),
            enqueueReason: buildDraftExecutionEnqueueReason(activeDraftJob),
            activeJobId: activeDraftJob?.jobId ?? null,
            activeJobStatus: activeDraftJob?.status ?? null,
            cancellationState: activeDraftJob?.cancellationState ?? null,
          },
        },
        retryPolicy: AGENT_WORKER_RETRY_POLICY,
        v1Scope: AGENT_WORKER_V1_SCOPE,
        latestActivity: latestJob
          ? {
              jobId: latestJob.id,
              kind: latestJob.kind,
              status: latestJob.status,
              cancellationState: resolveAgentJobCancellationState(latestJob),
              createdAt: latestJob.created_at,
              updatedAt: latestJob.updated_at,
              latestRun: latestJob.latestRun
                ? {
                    runNumber: latestJob.latestRun.run_number,
                    status: latestJob.latestRun.status,
                    claimedAt: latestJob.latestRun.claimed_at,
                    startedAt: latestJob.latestRun.started_at,
                    finishedAt: latestJob.latestRun.finished_at,
                    heartbeatAt: latestJob.latestRun.heartbeat_at,
                  }
                : null,
            }
          : null,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load agent status."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
