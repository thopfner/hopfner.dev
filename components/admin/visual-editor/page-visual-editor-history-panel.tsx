"use client"
import { useCallback, useEffect, useState } from "react"
import { IconHistory, IconArrowBackUp } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/browser"
import { useVisualEditorStore } from "./page-visual-editor-store"

type VersionEntry = {
  id: string
  version: number
  status: string
  created_at: string
  published_at: string | null
}

export function HistoryPanel({ sectionId }: { sectionId: string }) {
  const { pageState, reload, setSaveStatus } = useVisualEditorStore()
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)

  const node = pageState?.sections.find((s) => s.sectionId === sectionId)
  const isGlobal = node?.isGlobal ?? false
  const ownerId = isGlobal ? node?.globalSectionId : sectionId

  useEffect(() => {
    if (!ownerId) return
    setLoading(true)
    const supabase = createClient()
    const table = isGlobal ? "global_section_versions" : "section_versions"
    const col = isGlobal ? "global_section_id" : "section_id"
    supabase.from(table).select("id, version, status, created_at, published_at")
      .eq(col, ownerId).order("version", { ascending: false })
      .then(({ data }) => { setVersions((data ?? []) as VersionEntry[]); setLoading(false) })
  }, [ownerId, isGlobal])

  const handleRestore = useCallback(async (versionId: string) => {
    if (!ownerId) return
    setRestoring(versionId)
    const supabase = createClient()
    const rpc = isGlobal ? "rollback_global_section_to_version" : "restore_section_version"
    const args = isGlobal
      ? { p_global_section_id: ownerId, p_from_version_id: versionId }
      : { p_section_id: ownerId, p_from_version_id: versionId }

    const { error } = await supabase.rpc(rpc, args)
    if (error) {
      setSaveStatus("error", error.message)
    } else {
      setSaveStatus("saved")
      await reload()
    }
    setRestoring(null)
  }, [ownerId, isGlobal, reload, setSaveStatus])

  const fmtDate = (ts: string) => {
    try { return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) } catch { return ts }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--mantine-color-dimmed)] uppercase tracking-wider">
        <IconHistory size={12} /> Version History
      </div>
      {loading ? (
        <div className="text-xs text-[var(--mantine-color-dimmed)] py-2">Loading...</div>
      ) : versions.length === 0 ? (
        <div className="text-xs text-[var(--mantine-color-dimmed)] py-2">No versions</div>
      ) : (
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {versions.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-[var(--mantine-color-dark-6)] text-[10px]">
              <div>
                <span className="font-medium text-[var(--mantine-color-text)]">v{v.version}</span>
                <span className={`ml-1.5 px-1 py-0.5 rounded text-[9px] ${
                  v.status === "published" ? "bg-green-500/20 text-green-300"
                    : v.status === "draft" ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-[var(--mantine-color-dark-4)] text-[var(--mantine-color-dimmed)]"
                }`}>{v.status}</span>
                <div className="text-[9px] text-[var(--mantine-color-dimmed)] mt-0.5">{fmtDate(v.created_at)}</div>
              </div>
              {v.status !== "draft" && (
                <button
                  type="button"
                  disabled={restoring === v.id}
                  onClick={() => handleRestore(v.id)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium rounded text-blue-300 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                  title="Restore this version"
                >
                  <IconArrowBackUp size={11} /> {restoring === v.id ? "..." : "Restore"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
