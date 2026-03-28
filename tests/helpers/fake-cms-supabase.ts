import type { SnapshotPayload } from "@/lib/cms/content-snapshots"

type JsonRecord = Record<string, unknown>

export type FakePageRow = {
  id: string
  slug: string
  title: string
  updated_at?: string
  bg_image_url?: string | null
  formatting_override?: Record<string, unknown> | null
}

export type FakeSectionRow = {
  id: string
  page_id: string
  key: string | null
  section_type: string
  enabled: boolean
  position: number
  global_section_id?: string | null
  formatting_override?: Record<string, unknown> | null
}

export type FakeSectionVersionRow = {
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
  created_at?: string
  published_at?: string | null
}

export type FakeGlobalSectionRow = {
  id: string
  section_type: string
  key: string | null
}

export type FakeGlobalSectionVersionRow = {
  id: string
  global_section_id: string
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
  created_at?: string
  published_at?: string | null
}

export type FakeSectionTypeDefaultRow = {
  section_type: string
  label: string
  description: string | null
  default_title: string | null
  default_subtitle: string | null
  default_cta_primary_label: string | null
  default_cta_primary_href: string | null
  default_cta_secondary_label: string | null
  default_cta_secondary_href: string | null
  default_background_media_url: string | null
  default_formatting: Record<string, unknown>
  default_content: Record<string, unknown>
  capabilities: Record<string, unknown>
}

export type FakeSectionTypeRegistryRow = {
  key: string
  source: string
  composer_schema?: unknown
  is_active?: boolean
  renderer?: string | null
}

export type FakeTailwindWhitelistRow = {
  class: string
}

export type FakeSiteFormattingSettingsRow = {
  id: string
  settings: Record<string, unknown> | null
}

export type FakeDesignThemePresetRow = {
  id: string
  key: string
  name: string
  description: string | null
  tokens: Record<string, unknown>
  is_system: boolean
  created_at?: string
  updated_at?: string
}

export type FakeMediaRow = {
  id: string
  bucket: string
  path: string
  mime_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  alt: string | null
  created_at?: string
}

export type FakeContentSnapshotRow = {
  id: string
  source: string
  label: string | null
  target_page_slugs: string[]
  payload: SnapshotPayload
  created_by: string | null
  created_at?: string
}

export type FakeCmsState = {
  pages: FakePageRow[]
  sections: FakeSectionRow[]
  section_versions: FakeSectionVersionRow[]
  global_sections: FakeGlobalSectionRow[]
  global_section_versions: FakeGlobalSectionVersionRow[]
  section_type_defaults: FakeSectionTypeDefaultRow[]
  section_type_registry: FakeSectionTypeRegistryRow[]
  tailwind_class_whitelist: FakeTailwindWhitelistRow[]
  site_formatting_settings: FakeSiteFormattingSettingsRow[]
  design_theme_presets: FakeDesignThemePresetRow[]
  media: FakeMediaRow[]
  cms_content_snapshots: FakeContentSnapshotRow[]
  section_preset_registry: JsonRecord[]
  section_presentation_presets: JsonRecord[]
  component_family_presets: JsonRecord[]
  section_control_capabilities: JsonRecord[]
}

type FakeTableName = keyof FakeCmsState
type FakeRow = JsonRecord

function clone<T>(value: T): T {
  return structuredClone(value)
}

function nowFactory() {
  let tick = 0
  return () => new Date(Date.UTC(2026, 2, 27, 0, 0, tick++)).toISOString()
}

function normalizeSeed(seed: Partial<FakeCmsState>): FakeCmsState {
  return {
    pages: clone(seed.pages ?? []),
    sections: clone(seed.sections ?? []),
    section_versions: clone(seed.section_versions ?? []),
    global_sections: clone(seed.global_sections ?? []),
    global_section_versions: clone(seed.global_section_versions ?? []),
    section_type_defaults: clone(seed.section_type_defaults ?? []),
    section_type_registry: clone(seed.section_type_registry ?? []),
    tailwind_class_whitelist: clone(seed.tailwind_class_whitelist ?? []),
    site_formatting_settings: clone(seed.site_formatting_settings ?? []),
    design_theme_presets: clone(seed.design_theme_presets ?? []),
    media: clone(seed.media ?? []),
    cms_content_snapshots: clone(seed.cms_content_snapshots ?? []),
    section_preset_registry: clone(seed.section_preset_registry ?? []),
    section_presentation_presets: clone(seed.section_presentation_presets ?? []),
    component_family_presets: clone(seed.component_family_presets ?? []),
    section_control_capabilities: clone(seed.section_control_capabilities ?? []),
  }
}

function replaceTableRows<K extends FakeTableName>(
  state: FakeCmsState,
  table: K,
  rows: FakeCmsState[K]
) {
  state[table] = rows
}

function compareValues(left: unknown, right: unknown) {
  if (left === right) return 0
  if (left === undefined || left === null) return -1
  if (right === undefined || right === null) return 1
  return String(left).localeCompare(String(right), undefined, { numeric: true })
}

function createSelectQuery<T extends FakeRow>(readRows: () => T[]) {
  const filters: Array<(row: T) => boolean> = []
  const orderings: Array<{ field: string; ascending: boolean }> = []
  let limitCount: number | null = null
  let rangeStart: number | null = null
  let rangeEnd: number | null = null

  function materialize() {
    let rows = [...readRows()]
    for (const filter of filters) {
      rows = rows.filter(filter)
    }
    for (const { field, ascending } of orderings) {
      rows.sort((left, right) => {
        const comparison = compareValues(left[field], right[field])
        return ascending ? comparison : -comparison
      })
    }
    if (rangeStart !== null || rangeEnd !== null) {
      rows = rows.slice(rangeStart ?? 0, (rangeEnd ?? rows.length - 1) + 1)
    } else if (limitCount !== null) {
      rows = rows.slice(0, limitCount)
    }
    return rows
  }

  const query = {
    eq(field: string, value: unknown) {
      filters.push((row) => row[field] === value)
      return query
    },
    in(field: string, values: unknown[]) {
      filters.push((row) => values.includes(row[field]))
      return query
    },
    order(field: string, options?: { ascending?: boolean }) {
      orderings.push({ field, ascending: options?.ascending ?? true })
      return query
    },
    limit(value: number) {
      limitCount = value
      return query
    },
    range(from: number, to: number) {
      rangeStart = from
      rangeEnd = to
      return query
    },
    ilike(field: string, pattern: string) {
      const needle = pattern.replace(/%/g, "").toLowerCase()
      filters.push((row) => String(row[field] ?? "").toLowerCase().includes(needle))
      return query
    },
    maybeSingle<U = T>() {
      const row = materialize()[0] ?? null
      return Promise.resolve({ data: row as unknown as U | null, error: null })
    },
    single<U = T>() {
      const row = materialize()[0] ?? null
      if (!row) {
        return Promise.resolve({
          data: null,
          error: { message: "Row not found." },
        })
      }
      return Promise.resolve({ data: row as unknown as U, error: null })
    },
    then<TResult1 = { data: T[]; error: null }, TResult2 = never>(
      onfulfilled?:
        | ((value: { data: T[]; error: null }) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      return Promise.resolve({ data: materialize(), error: null as null }).then(
        onfulfilled,
        onrejected
      )
    },
  }

  return query
}

function createMutationSelect<T>(rows: T[]) {
  return {
    single<U = T>() {
      const row = rows[0] ?? null
      if (!row) {
        return Promise.resolve({
          data: null,
          error: { message: "Row not found." },
        })
      }
      return Promise.resolve({ data: row as unknown as U, error: null })
    },
    maybeSingle<U = T>() {
      const row = rows[0] ?? null
      return Promise.resolve({ data: row as unknown as U | null, error: null })
    },
  }
}

function createMutationQuery<T>(execute: () => T[]) {
  let executed = false
  let rows: T[] = []

  function run() {
    if (!executed) {
      rows = execute()
      executed = true
    }
    return rows
  }

  return {
    select(columns: string) {
      void columns
      return createMutationSelect(run())
    },
    then<TResult1 = { data: null; error: null }, TResult2 = never>(
      onfulfilled?:
        | ((value: { data: null; error: null }) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      run()
      return Promise.resolve({ data: null, error: null as null }).then(onfulfilled, onrejected)
    },
  }
}

export function createFakeCmsSupabase(seed: Partial<FakeCmsState> = {}) {
  const state = normalizeSeed(seed)
  const nextIso = nowFactory()
  let nextPageId = state.pages.length + 1
  let nextSectionId = state.sections.length + 1
  let nextSectionVersionId = state.section_versions.length + 1
  let nextSnapshotId = state.cms_content_snapshots.length + 1
  let nextMediaId = state.media.length + 1

  function deleteSectionsByIds(sectionIds: string[]) {
    if (!sectionIds.length) return
    state.sections = state.sections.filter((section) => !sectionIds.includes(section.id))
    state.section_versions = state.section_versions.filter(
      (version) => !sectionIds.includes(version.section_id)
    )
  }

  function deleteSectionsByPageId(pageId: string) {
    const sectionIds = state.sections
      .filter((section) => section.page_id === pageId)
      .map((section) => section.id)
    deleteSectionsByIds(sectionIds)
  }

  function deletePagesBySlug(slug: string) {
    const pageIds = state.pages.filter((page) => page.slug === slug).map((page) => page.id)
    state.pages = state.pages.filter((page) => page.slug !== slug)
    for (const pageId of pageIds) {
      deleteSectionsByPageId(pageId)
    }
  }

  function readRows(table: FakeTableName): FakeRow[] {
    return state[table] as FakeRow[]
  }

  function insertRows(table: FakeTableName, input: FakeRow | FakeRow[]) {
    const rows = Array.isArray(input) ? input : [input]

    switch (table) {
      case "pages":
        return rows.map((row) => {
          const inserted: FakePageRow = {
            id: String(row.id ?? `page-${nextPageId++}`),
            slug: String(row.slug ?? ""),
            title: String(row.title ?? ""),
            updated_at: (row.updated_at as string | undefined) ?? nextIso(),
            bg_image_url: (row.bg_image_url as string | null | undefined) ?? null,
            formatting_override:
              (row.formatting_override as Record<string, unknown> | null | undefined) ?? null,
          }
          state.pages.push(inserted)
          return inserted
        })
      case "sections":
        return rows.map((row) => {
          const inserted: FakeSectionRow = {
            id: String(row.id ?? `section-${nextSectionId++}`),
            page_id: String(row.page_id ?? ""),
            key: (row.key as string | null | undefined) ?? null,
            section_type: String(row.section_type ?? ""),
            enabled: row.enabled === false ? false : true,
            position: Number(row.position ?? 0),
            global_section_id: (row.global_section_id as string | null | undefined) ?? null,
            formatting_override:
              (row.formatting_override as Record<string, unknown> | null | undefined) ?? null,
          }
          state.sections.push(inserted)
          return inserted
        })
      case "section_versions":
        return rows.map((row) => {
          const inserted: FakeSectionVersionRow = {
            id: String(row.id ?? `section-version-${nextSectionVersionId++}`),
            section_id: String(row.section_id ?? ""),
            version: Number(row.version ?? 1),
            status: (row.status as FakeSectionVersionRow["status"]) ?? "draft",
            title: (row.title as string | null | undefined) ?? null,
            subtitle: (row.subtitle as string | null | undefined) ?? null,
            cta_primary_label: (row.cta_primary_label as string | null | undefined) ?? null,
            cta_primary_href: (row.cta_primary_href as string | null | undefined) ?? null,
            cta_secondary_label: (row.cta_secondary_label as string | null | undefined) ?? null,
            cta_secondary_href: (row.cta_secondary_href as string | null | undefined) ?? null,
            background_media_url:
              (row.background_media_url as string | null | undefined) ?? null,
            formatting: clone((row.formatting as Record<string, unknown> | undefined) ?? {}),
            content: clone((row.content as Record<string, unknown> | undefined) ?? {}),
            created_at: (row.created_at as string | undefined) ?? nextIso(),
            published_at: (row.published_at as string | null | undefined) ?? null,
          }
          state.section_versions.push(inserted)
          return inserted
        })
      case "site_formatting_settings":
        return rows.map((row) => {
          const inserted: FakeSiteFormattingSettingsRow = {
            id: String(row.id ?? "default"),
            settings: (row.settings as Record<string, unknown> | null | undefined) ?? null,
          }
          state.site_formatting_settings.push(inserted)
          return inserted
        })
      case "cms_content_snapshots":
        return rows.map((row) => {
          const inserted: FakeContentSnapshotRow = {
            id: String(row.id ?? `snapshot-${nextSnapshotId++}`),
            source: String(row.source ?? ""),
            label: (row.label as string | null | undefined) ?? null,
            target_page_slugs: clone((row.target_page_slugs as string[] | undefined) ?? []),
            payload: clone((row.payload as SnapshotPayload | undefined) ?? { pages: [] }),
            created_by: (row.created_by as string | null | undefined) ?? null,
            created_at: (row.created_at as string | undefined) ?? nextIso(),
          }
          state.cms_content_snapshots.push(inserted)
          return inserted
        })
      case "media":
        return rows.map((row) => {
          const inserted: FakeMediaRow = {
            id: String(row.id ?? `media-${nextMediaId++}`),
            bucket: String(row.bucket ?? ""),
            path: String(row.path ?? ""),
            mime_type: (row.mime_type as string | null | undefined) ?? null,
            size_bytes: (row.size_bytes as number | null | undefined) ?? null,
            width: (row.width as number | null | undefined) ?? null,
            height: (row.height as number | null | undefined) ?? null,
            alt: (row.alt as string | null | undefined) ?? null,
            created_at: (row.created_at as string | undefined) ?? nextIso(),
          }
          state.media.push(inserted)
          return inserted
        })
      default:
        return rows.map((row) => {
          const inserted = clone(row)
          ;(state[table] as FakeRow[]).push(inserted)
          return inserted
        })
    }
  }

  function upsertRows(table: FakeTableName, input: FakeRow, options?: { onConflict?: string }) {
    switch (table) {
      case "pages": {
        if (options?.onConflict && options.onConflict !== "slug") {
          throw new Error(`Unsupported pages upsert conflict target: ${options.onConflict}`)
        }
        const slug = String(input.slug ?? "")
        let row = state.pages.find((page) => page.slug === slug) ?? null
        if (!row) {
          row = {
            id: String(input.id ?? `page-${nextPageId++}`),
            slug,
            title: String(input.title ?? ""),
            updated_at: nextIso(),
            bg_image_url: (input.bg_image_url as string | null | undefined) ?? null,
            formatting_override:
              (input.formatting_override as Record<string, unknown> | null | undefined) ?? null,
          }
          state.pages.push(row)
        } else {
          row.title = String(input.title ?? row.title)
          row.updated_at = nextIso()
          if ("bg_image_url" in input) {
            row.bg_image_url = (input.bg_image_url as string | null | undefined) ?? null
          }
          if ("formatting_override" in input) {
            row.formatting_override =
              (input.formatting_override as Record<string, unknown> | null | undefined) ?? null
          }
        }
        return [row]
      }
      case "site_formatting_settings": {
        const id = String(input.id ?? "default")
        let row = state.site_formatting_settings.find((entry) => entry.id === id) ?? null
        if (!row) {
          row = {
            id,
            settings: (input.settings as Record<string, unknown> | null | undefined) ?? null,
          }
          state.site_formatting_settings.push(row)
        } else {
          row.settings = (input.settings as Record<string, unknown> | null | undefined) ?? null
        }
        return [row]
      }
      default:
        throw new Error(`Unsupported upsert table: ${table}`)
    }
  }

  function updateRows(table: FakeTableName, patch: FakeRow, filters: Array<(row: FakeRow) => boolean>) {
    const rows = readRows(table).filter((row) => filters.every((filter) => filter(row)))

    switch (table) {
      case "pages":
        for (const row of rows as FakePageRow[]) {
          Object.assign(row, clone(patch))
          row.updated_at = nextIso()
        }
        return rows
      default:
        for (const row of rows) {
          Object.assign(row, clone(patch))
        }
        return rows
    }
  }

  function deleteRows(table: FakeTableName, filters: Array<(row: FakeRow) => boolean>) {
    const rows = readRows(table).filter((row) => filters.every((filter) => filter(row)))

    switch (table) {
      case "pages":
        for (const row of rows as FakePageRow[]) {
          deletePagesBySlug(row.slug)
        }
        break
      case "sections":
        deleteSectionsByIds((rows as FakeSectionRow[]).map((row) => row.id))
        break
      default:
        replaceTableRows(
          state,
          table,
          state[table].filter((row) => !filters.every((filter) => filter(row as unknown as FakeRow)))
        )
        break
    }

    return rows
  }

  const fakeSupabase = {
    __state: state,
    __storage: [] as Array<{
      bucket: string
      path: string
      bytes: Uint8Array
      contentType: string | null
    }>,
    from(table: FakeTableName) {
      return {
        select(columns: string) {
          void columns
          return createSelectQuery(() => readRows(table))
        },
        insert(value: FakeRow | FakeRow[]) {
          return createMutationQuery(() => insertRows(table, value))
        },
        upsert(value: FakeRow, options?: { onConflict?: string }) {
          return createMutationQuery(
            () => upsertRows(table, value, options) as unknown as FakeRow[]
          )
        },
        update(patch: FakeRow) {
          const filters: Array<(row: FakeRow) => boolean> = []
          return {
            eq(field: string, value: unknown) {
              filters.push((row) => row[field] === value)
              return this
            },
            select(columns: string) {
              void columns
              return createMutationSelect(updateRows(table, patch, filters))
            },
            then<TResult1 = { data: null; error: null }, TResult2 = never>(
              onfulfilled?:
                | ((value: { data: null; error: null }) => TResult1 | PromiseLike<TResult1>)
                | null,
              onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
            ) {
              updateRows(table, patch, filters)
              return Promise.resolve({ data: null, error: null as null }).then(
                onfulfilled,
                onrejected
              )
            },
          }
        },
        delete() {
          const filters: Array<(row: FakeRow) => boolean> = []
          return {
            eq(field: string, value: unknown) {
              filters.push((row) => row[field] === value)
              return this
            },
            then<TResult1 = { data: null; error: null }, TResult2 = never>(
              onfulfilled?:
                | ((value: { data: null; error: null }) => TResult1 | PromiseLike<TResult1>)
                | null,
              onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
            ) {
              deleteRows(table, filters)
              return Promise.resolve({ data: null, error: null as null }).then(
                onfulfilled,
                onrejected
              )
            },
          }
        },
      }
    },
    storage: {
      from(bucket: string) {
        return {
          upload: (
            path: string,
            bytes: ArrayBuffer | ArrayBufferView,
            options?: { contentType?: string; upsert?: boolean }
          ) => {
            const normalizedBytes =
              bytes instanceof Uint8Array
                ? bytes
                : new Uint8Array(
                    bytes instanceof ArrayBuffer ? bytes : bytes.buffer.slice(0)
                  )
            const existingIndex = fakeSupabase.__storage.findIndex(
              (entry) => entry.bucket === bucket && entry.path === path
            )
            if (existingIndex >= 0 && options?.upsert === false) {
              return Promise.resolve({ error: { message: "The resource already exists" } })
            }
            const entry = {
              bucket,
              path,
              bytes: normalizedBytes,
              contentType: options?.contentType ?? null,
            }
            if (existingIndex >= 0) {
              fakeSupabase.__storage[existingIndex] = entry
            } else {
              fakeSupabase.__storage.push(entry)
            }
            return Promise.resolve({ error: null })
          },
          remove: (paths: string[]) => {
            fakeSupabase.__storage = fakeSupabase.__storage.filter(
              (entry) => !(entry.bucket === bucket && paths.includes(entry.path))
            )
            return Promise.resolve({ error: null })
          },
          getPublicUrl: (path: string) => ({
            data: { publicUrl: `https://cdn.example.com/${bucket}/${path}` },
          }),
        }
      },
    },
  }

  return fakeSupabase
}
