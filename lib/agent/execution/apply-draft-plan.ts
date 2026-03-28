import type { SupabaseClient } from "@supabase/supabase-js"

import type { EditorDraft } from "@/components/admin/section-editor/types"
import {
  addCmsSection,
  applyDesignThemePreset,
  applySiteThemeSettings,
  deleteCmsSection,
  ensureCmsPage,
  listCmsPageSections,
  reorderCmsSections,
  saveCmsSectionDraft,
  updateCmsSectionRow,
  type CmsPageSectionRow,
} from "@/lib/cms/commands"
import { normalizeFormatting } from "@/lib/cms/payload"

import { createGeminiGeneratedImageProvider } from "../media/providers/gemini"
import { registerGeneratedImage } from "../media/register-generated-image"
import type { GeneratedImageProvider, RegisterGeneratedImageResult } from "../media/types"
import type {
  AgentDraftPagePlan,
  AgentDraftPlan,
  AgentDraftPlannerRunMetadata,
  AgentDraftSectionPlan,
} from "../planning/types"
import {
  buildAgentDraftAppliedResult,
  buildAgentDraftApplyPendingResult,
} from "./idempotency"
import { createAgentDraftSnapshot } from "./snapshots"
import type { AgentDraftApplyResult } from "./types"

type UpdateJobResult = (input: {
  jobId: string
  result: Record<string, unknown>
  merge?: boolean
}) => Promise<unknown>

type ReconcilePageResult = {
  pageId: string
  slug: string
  created: boolean
  deletedSectionIds: string[]
}

function planSectionToEditorDraft(section: AgentDraftSectionPlan, backgroundMediaUrl?: string): EditorDraft {
  return {
    meta: {
      title: section.draft.meta.title,
      subtitle: section.draft.meta.subtitle,
      ctaPrimaryLabel: section.draft.meta.ctaPrimaryLabel,
      ctaPrimaryHref: section.draft.meta.ctaPrimaryHref,
      ctaSecondaryLabel: section.draft.meta.ctaSecondaryLabel,
      ctaSecondaryHref: section.draft.meta.ctaSecondaryHref,
      backgroundMediaUrl: backgroundMediaUrl ?? section.draft.meta.backgroundMediaUrl,
    },
    formatting: normalizeFormatting(section.draft.formatting),
    content: section.draft.content,
  }
}

type GeneratedAssetRecord = Pick<RegisterGeneratedImageResult, "id" | "bucket" | "path">

async function cleanupGeneratedAssets(
  supabase: SupabaseClient,
  assets: GeneratedAssetRecord[],
  originalError: unknown
) {
  const cleanupErrors: string[] = []

  for (const asset of [...assets].reverse()) {
    const { error: storageError } = await supabase.storage.from(asset.bucket).remove([asset.path])
    if (storageError && !/not\s+found/i.test(storageError.message)) {
      cleanupErrors.push(storageError.message)
      continue
    }

    const { error: deleteError } = await supabase.from("media").delete().eq("id", asset.id)
    if (deleteError) {
      cleanupErrors.push(deleteError.message)
    }
  }

  if (!cleanupErrors.length) return

  const originalMessage =
    originalError instanceof Error ? originalError.message : "Failed to apply agent draft plan."
  throw new Error(`${originalMessage} Cleanup also failed: ${cleanupErrors.join("; ")}`)
}

async function resolveSectionBackgroundMediaUrl(input: {
  supabase: SupabaseClient
  section: AgentDraftSectionPlan
  provider: GeneratedImageProvider
  generatedAssets: GeneratedAssetRecord[]
}) {
  const backgroundImage = input.section.media?.backgroundImage
  if (!backgroundImage?.prompt) {
    return input.section.draft.meta.backgroundMediaUrl
  }

  const generated = await registerGeneratedImage(input.supabase, {
    prompt: backgroundImage.prompt,
    alt: backgroundImage.alt,
    provider: input.provider,
  })
  input.generatedAssets.push({
    id: generated.id,
    bucket: generated.bucket,
    path: generated.path,
  })
  return generated.url
}

async function loadAllowedTailwindClasses(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase.from("tailwind_class_whitelist").select("class")
  if (error) {
    throw new Error(error.message)
  }

  return new Set(
    ((data ?? []) as Array<{ class: string }>)
      .map((row) => row.class)
      .filter(Boolean)
  )
}

function findReusableSection(
  existingSections: CmsPageSectionRow[],
  unmatchedSectionIds: Set<string>,
  planSection: AgentDraftSectionPlan
) {
  if (planSection.key) {
    const keyedMatch =
      existingSections.find(
        (section) => unmatchedSectionIds.has(section.id) && section.key === planSection.key
      ) ?? null

    if (
      keyedMatch &&
      !keyedMatch.global_section_id &&
      keyedMatch.section_type === planSection.sectionType
    ) {
      return keyedMatch
    }

    return null
  }

  return (
    existingSections.find(
      (section) =>
        unmatchedSectionIds.has(section.id) &&
        !section.global_section_id &&
        section.section_type === planSection.sectionType
    ) ?? null
  )
}

async function reconcileCmsDraftPage(
  supabase: SupabaseClient,
  pagePlan: AgentDraftPagePlan,
  allowedClasses: Set<string>,
  generatedImageProvider: GeneratedImageProvider,
  generatedAssets: GeneratedAssetRecord[]
): Promise<ReconcilePageResult> {
  const { data: existingPage, error: existingPageError } = await supabase
    .from("pages")
    .select("id, slug, title")
    .eq("slug", pagePlan.slug)
    .maybeSingle<{ id: string; slug: string; title: string }>()

  if (existingPageError) {
    throw new Error(existingPageError.message)
  }

  const page = await ensureCmsPage(supabase, {
    slug: pagePlan.slug,
    title: pagePlan.title,
  })

  const existingSections = await listCmsPageSections(supabase, page.id)
  const unmatchedSectionIds = new Set(existingSections.map((section) => section.id))
  const nextOrder: string[] = []
  const deletedSectionIds: string[] = []

  for (const planSection of pagePlan.sections) {
    const backgroundMediaUrl = await resolveSectionBackgroundMediaUrl({
      supabase,
      section: planSection,
      provider: generatedImageProvider,
      generatedAssets,
    })

    const keyedConflict =
      planSection.key
        ? existingSections.find(
            (section) =>
              unmatchedSectionIds.has(section.id) &&
              section.key === planSection.key &&
              (section.global_section_id !== null || section.section_type !== planSection.sectionType)
          ) ?? null
        : null

    if (keyedConflict) {
      await deleteCmsSection(supabase, { sectionId: keyedConflict.id })
      unmatchedSectionIds.delete(keyedConflict.id)
      deletedSectionIds.push(keyedConflict.id)
    }

    const reusable = findReusableSection(existingSections, unmatchedSectionIds, planSection)
    if (reusable) {
      unmatchedSectionIds.delete(reusable.id)
      await updateCmsSectionRow(supabase, {
        sectionId: reusable.id,
        key: planSection.key ?? null,
        enabled: planSection.enabled,
      })
      await saveCmsSectionDraft(supabase, {
        scope: "page",
        sectionId: reusable.id,
        sectionType: planSection.sectionType,
        draft: planSectionToEditorDraft(planSection, backgroundMediaUrl),
        allowedClasses,
      })
      nextOrder.push(reusable.id)
      continue
    }

    const added = await addCmsSection(supabase, {
      pageId: page.id,
      sectionType: planSection.sectionType,
      position: nextOrder.length,
      key: planSection.key ?? null,
      enabled: planSection.enabled,
    })

    await saveCmsSectionDraft(supabase, {
      scope: "page",
      sectionId: added.sectionId,
      sectionType: planSection.sectionType,
      draft: planSectionToEditorDraft(planSection, backgroundMediaUrl),
      allowedClasses,
    })
    nextOrder.push(added.sectionId)
  }

  for (const section of existingSections) {
    if (!unmatchedSectionIds.has(section.id)) continue
    await deleteCmsSection(supabase, { sectionId: section.id })
    deletedSectionIds.push(section.id)
  }

  await reorderCmsSections(supabase, { order: nextOrder })

  return {
    pageId: page.id,
    slug: page.slug,
    created: !existingPage,
    deletedSectionIds,
  }
}

async function applyPlanTheme(
  supabase: SupabaseClient,
  plan: AgentDraftPlan
): Promise<AgentDraftApplyResult["themeApplied"]> {
  if (!plan.theme) {
    return null
  }

  const hasSettings = Boolean(plan.theme.settings && Object.keys(plan.theme.settings).length > 0)

  if (plan.theme.presetId) {
    await applyDesignThemePreset(supabase, plan.theme.presetId)
  }

  if (hasSettings) {
    await applySiteThemeSettings(supabase, {
      settings: plan.theme.settings ?? {},
      presetId: plan.theme.presetId ?? undefined,
    })
  }

  if (!plan.theme.presetId && !hasSettings) {
    return null
  }

  return {
    presetId: plan.theme.presetId ?? null,
    hasSettings,
  }
}

export async function applyAgentDraftPlan(input: {
  supabase: SupabaseClient
  jobId: string
  prompt: string
  plan: AgentDraftPlan
  planner: AgentDraftPlannerRunMetadata
  reviewedSourceJobId?: string | null
  updateJobResult: UpdateJobResult
  generatedImageProvider?: GeneratedImageProvider
}) {
  const snapshot = await createAgentDraftSnapshot(input.supabase, {
    jobId: input.jobId,
    pageSlugs: input.plan.pages.map((page) => page.slug),
  })

  const pendingResult = buildAgentDraftApplyPendingResult({
    prompt: input.prompt,
    plan: input.plan,
    rollbackSnapshotId: snapshot.id,
    planner: input.planner,
    reviewedSourceJobId: input.reviewedSourceJobId ?? null,
  })

  await input.updateJobResult({
    jobId: input.jobId,
    result: { phase3: pendingResult },
    merge: true,
  })

  const allowedClasses = await loadAllowedTailwindClasses(input.supabase)
  const pageResults: ReconcilePageResult[] = []
  const generatedAssets: GeneratedAssetRecord[] = []
  const generatedImageProvider =
    input.generatedImageProvider ?? createGeminiGeneratedImageProvider()

  try {
    for (const pagePlan of input.plan.pages) {
      pageResults.push(
        await reconcileCmsDraftPage(
          input.supabase,
          pagePlan,
          allowedClasses,
          generatedImageProvider,
          generatedAssets
        )
      )
    }

    const themeApplied = await applyPlanTheme(input.supabase, input.plan)

    const appliedResult = buildAgentDraftAppliedResult({
      prompt: input.prompt,
      plan: input.plan,
      rollbackSnapshotId: snapshot.id,
      planner: input.planner,
      reviewedSourceJobId: input.reviewedSourceJobId ?? null,
      appliedAt: new Date().toISOString(),
      createdPageSlugs: pageResults.filter((page) => page.created).map((page) => page.slug),
      updatedPageSlugs: pageResults.filter((page) => !page.created).map((page) => page.slug),
      deletedSectionIds: pageResults.flatMap((page) => page.deletedSectionIds),
      themeApplied,
    })

    await input.updateJobResult({
      jobId: input.jobId,
      result: { phase3: appliedResult },
      merge: true,
    })

    return appliedResult
  } catch (error) {
    await cleanupGeneratedAssets(input.supabase, generatedAssets, error)
    throw error
  }
}
