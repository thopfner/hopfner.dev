# 02 Phase 0 Lockdown and Contract Hotfixes

This phase is mandatory before more UI work.

## Phase Goal

Stop accidental rollout and fix the known correctness defects in the current implementation.

## Known Defects To Fix

### 1. Broken publish RPC call

Current problem:

- visual editor calls `publish_section_version` with only `p_version_id`
- real function requires `p_section_id` and `p_version_id`

Relevant files:

- `components/admin/visual-editor/use-visual-section-persistence.ts`
- `supabase/schema.sql`
- `components/admin/section-editor/use-section-editor-resources.ts`

Required fix:

- mirror the existing form editor argument shape exactly
- add a test that fails if `p_section_id` is omitted again

### 2. Loader queries wrong columns

Current problem:

- visual loader queries `section_type_registry.section_type`
- visual loader queries `tailwind_class_whitelist.class_name`
- real codebase uses `section_type_registry.key`
- real codebase uses `tailwind_class_whitelist.class`

Relevant files:

- `lib/admin/visual-editor/load-page-visual-state.ts`
- `lib/cms/get-published-page.ts`

Required fix:

- align selects with the real schema
- check and surface query errors instead of silently continuing

### 3. Preview misses section row overrides

Current problem:

- visual preview does not load or apply `sections.formatting_override`
- public renderer does apply it

Relevant files:

- `lib/admin/visual-editor/load-page-visual-state.ts`
- `components/admin/visual-editor/page-visual-editor-node.tsx`
- `app/(marketing)/[slug]/page.tsx`

Required fix:

- load `formatting_override` in the section query
- include it in the section formatting merge

### 4. Feature flag defaults unsafe

Current problem:

- visual editor is enabled unless env explicitly sets false
- page editor always links to the visual route

Relevant files:

- `components/admin/visual-editor/feature-flag.ts`
- `app/admin/(protected)/pages/[pageId]/page-editor.tsx`

Required fix:

- feature flag defaults to off
- button only renders when enabled
- optionally add a smaller internal-pilot badge when on

### 5. Dirty-state switch flow leaves stale state

Current problem:

- save-and-switch path does not clear saved dirty state

Relevant files:

- `components/admin/visual-editor/page-visual-editor-dirty-dialog.tsx`
- `components/admin/visual-editor/page-visual-editor.tsx`

Required fix:

- clear dirty state after successful save-and-switch
- test the exact interaction

## Implementation Guidance

Keep this phase tight.

Do not:

- redesign the visual shell yet
- refactor the form editor
- attempt custom/composed support

Do:

- fix known defects
- add specific regression tests
- reduce rollout risk immediately

## Recommended Tests For This Phase

- loader returns whitelist from `class`
- loader resolves custom types from registry `key`
- save/publish adapter passes exact RPC args
- preview merge includes `formatting_override`
- dirty dialog save-and-switch clears dirty map
- visual editor button hidden when feature disabled

## Exit Criteria

- visual route is gated off by default
- publish works with correct RPC args
- loader matches the real schema
- preview includes section row overrides
- dirty-state handoff is correct
