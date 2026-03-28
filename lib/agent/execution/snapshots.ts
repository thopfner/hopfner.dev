import type { SupabaseClient } from "@supabase/supabase-js"

import {
  captureContentSnapshot,
  createContentSnapshot,
  loadContentSnapshot,
  restoreContentSnapshot,
} from "../../cms/content-snapshots"

export const AGENT_DRAFT_SNAPSHOT_SOURCE = "agent_site_build_draft"

export function buildAgentDraftSnapshotLabel(jobId: string): string {
  return `Pre-agent draft apply snapshot for job ${jobId}`
}

export async function createAgentDraftSnapshot(
  supabase: SupabaseClient,
  input: {
    jobId: string
    pageSlugs: string[]
    createdBy?: string | null
    label?: string | null
  }
) {
  const payload = await captureContentSnapshot(supabase, input.pageSlugs, {
    includeSiteFormatting: true,
  })
  return createContentSnapshot(supabase, {
    source: AGENT_DRAFT_SNAPSHOT_SOURCE,
    label: input.label ?? buildAgentDraftSnapshotLabel(input.jobId),
    targetPageSlugs: input.pageSlugs,
    payload,
    createdBy: input.createdBy ?? null,
  })
}

export async function rollbackAgentDraftSnapshot(
  supabase: SupabaseClient,
  snapshotId: string
) {
  const snapshot = await loadContentSnapshot(supabase, snapshotId)
  await restoreContentSnapshot(supabase, snapshot.payload, {
    restoreSiteFormatting: true,
  })
  return snapshot
}
