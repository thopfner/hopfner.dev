import type { SupabaseClient } from "@supabase/supabase-js"

export type SnapshotPage = {
  slug: string
  title: string
  sections: Array<{
    id: string
    key: string | null
    section_type: string
    enabled: boolean
    position: number
    global_section_id: string | null
    formatting_override: Record<string, unknown> | null
    versions: Array<{
      id: string
      version: number
      status: "draft" | "published" | "archived"
      title: string | null
      subtitle: string | null
      cta_primary_label: string | null
      cta_primary_href: string | null
      cta_secondary_label: string | null
      cta_secondary_href: string | null
      background_media_url: string | null
      formatting: Record<string, unknown>
      content: Record<string, unknown>
    }>
  }>
}

export type SnapshotTargetPageState = {
  slug: string
  existed: boolean
  page: SnapshotPage | null
}

export type SnapshotSiteFormattingState = {
  existed: boolean
  settings: Record<string, unknown> | null
}

export type SnapshotPayload = {
  pages: SnapshotPage[]
  targetPageStates?: SnapshotTargetPageState[]
  siteFormattingState?: SnapshotSiteFormattingState
}

export type CaptureContentSnapshotOptions = {
  includeSiteFormatting?: boolean
}

export type RestoreContentSnapshotOptions = {
  restoreSiteFormatting?: boolean
}

export type CmsContentSnapshotRow = {
  id: string
  source: string
  label: string | null
  target_page_slugs: string[]
  payload: SnapshotPayload
  created_by: string | null
  created_at: string
}

export type CreateContentSnapshotInput = {
  source: string
  label?: string | null
  targetPageSlugs: string[]
  payload: SnapshotPayload
  createdBy?: string | null
}

export async function captureContentSnapshot(
  supabase: SupabaseClient,
  slugs: string[],
  options?: CaptureContentSnapshotOptions
): Promise<SnapshotPayload> {
  const targetSlugs = Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean))).sort(
    (left, right) => left.localeCompare(right)
  )

  const { data: pages, error: pageError } = targetSlugs.length
    ? await supabase.from("pages").select("id, slug, title").in("slug", targetSlugs)
    : { data: [], error: null }

  if (pageError) throw new Error(pageError.message)

  const pageRows = (pages ?? []) as Array<{ id: string; slug: string; title: string }>
  const pageIds = pageRows.map((page) => page.id)

  const { data: sections, error: sectionError } = pageIds.length
    ? await supabase
        .from("sections")
        .select("id, page_id, key, section_type, enabled, position, global_section_id, formatting_override")
        .in("page_id", pageIds)
        .order("position", { ascending: true })
    : { data: [], error: null }

  if (sectionError) throw new Error(sectionError.message)

  const sectionRows = (sections ?? []) as Array<{
    id: string
    page_id: string
    key: string | null
    section_type: string
    enabled: boolean
    position: number
    global_section_id: string | null
    formatting_override: Record<string, unknown> | null
  }>

  const sectionIds = sectionRows.map((section) => section.id)

  const { data: versions, error: versionError } = sectionIds.length
    ? await supabase
        .from("section_versions")
        .select(
          "id, section_id, version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content"
        )
        .in("section_id", sectionIds)
        .order("version", { ascending: true })
    : { data: [], error: null }

  if (versionError) throw new Error(versionError.message)

  const versionRows = (versions ?? []) as Array<{
    id: string
    section_id: string
    version: number
    status: "draft" | "published" | "archived"
    title: string | null
    subtitle: string | null
    cta_primary_label: string | null
    cta_primary_href: string | null
    cta_secondary_label: string | null
    cta_secondary_href: string | null
    background_media_url: string | null
    formatting: Record<string, unknown>
    content: Record<string, unknown>
  }>

  const siteFormattingSnapshot = options?.includeSiteFormatting
    ? await (async () => {
        const { data, error } = await supabase
          .from("site_formatting_settings")
          .select("settings")
          .eq("id", "default")
          .maybeSingle<{ settings: Record<string, unknown> | null }>()

        if (error) throw new Error(error.message)

        return {
          existed: data !== null,
          settings: data?.settings ?? null,
        } satisfies SnapshotSiteFormattingState
      })()
    : null

  const snapshotPages = pageRows
    .sort((left, right) => left.slug.localeCompare(right.slug))
    .map((page) => ({
      slug: page.slug,
      title: page.title,
      sections: sectionRows
        .filter((section) => section.page_id === page.id)
        .map((section) => ({
          id: section.id,
          key: section.key,
          section_type: section.section_type,
          enabled: section.enabled,
          position: section.position,
          global_section_id: section.global_section_id,
          formatting_override: section.formatting_override ?? null,
          versions: versionRows.filter((version) => version.section_id === section.id),
        })),
    }))

  const pagesBySlug = new Map(snapshotPages.map((page) => [page.slug, page]))

  return {
    pages: snapshotPages,
    targetPageStates: targetSlugs.map((slug) => {
      const page = pagesBySlug.get(slug) ?? null
      return {
        slug,
        existed: page !== null,
        page,
      }
    }),
    ...(siteFormattingSnapshot ? { siteFormattingState: siteFormattingSnapshot } : {}),
  }
}

export async function createContentSnapshot(
  supabase: SupabaseClient,
  input: CreateContentSnapshotInput
): Promise<CmsContentSnapshotRow> {
  const { data, error } = await supabase
    .from("cms_content_snapshots")
    .insert({
      source: input.source,
      label: input.label?.trim() || null,
      target_page_slugs: input.targetPageSlugs,
      payload: input.payload,
      created_by: input.createdBy ?? null,
    })
    .select("id, source, label, target_page_slugs, payload, created_by, created_at")
    .single<CmsContentSnapshotRow>()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create content snapshot.")
  }

  return data
}

export async function loadContentSnapshot(
  supabase: SupabaseClient,
  snapshotId: string
): Promise<CmsContentSnapshotRow> {
  const { data, error } = await supabase
    .from("cms_content_snapshots")
    .select("id, source, label, target_page_slugs, payload, created_by, created_at")
    .eq("id", snapshotId)
    .single<CmsContentSnapshotRow>()

  if (error || !data) {
    throw new Error(error?.message ?? "Content snapshot not found.")
  }

  return data
}

export async function restoreContentSnapshot(
  supabase: SupabaseClient,
  snapshot: SnapshotPayload,
  options?: RestoreContentSnapshotOptions
) {
  const targetStates =
    snapshot.targetPageStates?.length
      ? snapshot.targetPageStates
      : snapshot.pages.map((page) => ({
          slug: page.slug,
          existed: true,
          page,
        }))

  for (const targetState of targetStates) {
    if (!targetState.existed) {
      const { error: deletePageError } = await supabase.from("pages").delete().eq("slug", targetState.slug)
      if (deletePageError) {
        throw new Error(`Remove page ${targetState.slug}: ${deletePageError.message}`)
      }
      continue
    }

    const page = targetState.page
    if (!page) {
      throw new Error(`Snapshot for page ${targetState.slug} is missing page content.`)
    }

    const { data: upsertedPage, error: pageError } = await supabase
      .from("pages")
      .upsert({ slug: page.slug, title: page.title }, { onConflict: "slug" })
      .select("id")
      .single<{ id: string }>()

    if (pageError) throw new Error(`Restore page ${page.slug}: ${pageError.message}`)

    const pageId = upsertedPage.id

    const { error: clearError } = await supabase.from("sections").delete().eq("page_id", pageId)
    if (clearError) throw new Error(`Restore page ${page.slug} cleanup: ${clearError.message}`)

    for (const section of page.sections.sort((left, right) => left.position - right.position)) {
      const { data: insertedSection, error: sectionError } = await supabase
        .from("sections")
        .insert({
          page_id: pageId,
          key: section.key,
          section_type: section.section_type,
          enabled: section.enabled,
          position: section.position,
          global_section_id: section.global_section_id,
          formatting_override: section.formatting_override,
        })
        .select("id")
        .single<{ id: string }>()

      if (sectionError) {
        throw new Error(`Restore section ${section.key ?? section.section_type}: ${sectionError.message}`)
      }

      for (const version of section.versions.sort((left, right) => left.version - right.version)) {
        const { error: versionError } = await supabase.from("section_versions").insert({
          section_id: insertedSection.id,
          version: version.version,
          status: version.status,
          title: version.title,
          subtitle: version.subtitle,
          cta_primary_label: version.cta_primary_label,
          cta_primary_href: version.cta_primary_href,
          cta_secondary_label: version.cta_secondary_label,
          cta_secondary_href: version.cta_secondary_href,
          background_media_url: version.background_media_url,
          formatting: version.formatting,
          content: version.content,
        })

        if (versionError) throw new Error(`Restore version ${version.version}: ${versionError.message}`)
      }
    }
  }

  if (options?.restoreSiteFormatting && snapshot.siteFormattingState) {
    if (!snapshot.siteFormattingState.existed) {
      const { error } = await supabase.from("site_formatting_settings").delete().eq("id", "default")
      if (error) {
        throw new Error(`Restore site formatting cleanup: ${error.message}`)
      }
      return
    }

    const { error } = await supabase.from("site_formatting_settings").upsert({
      id: "default",
      settings: snapshot.siteFormattingState.settings,
    })
    if (error) {
      throw new Error(`Restore site formatting: ${error.message}`)
    }
  }
}
