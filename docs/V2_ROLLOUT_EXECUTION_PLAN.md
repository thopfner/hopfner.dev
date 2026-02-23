# V2 Rollout Execution Plan (Admin + Frontend)

## Scope
V2 delivery for:
1. Global sections lifecycle (draft/publish, impact preview, where-used, staged publish, detach/fork)
2. Design token formatting with precedence + reset-to-inherited
3. Background style engine
4. Schema validation + publish gates
5. Audit/diff/rollback
6. QA gates + smoke/regression automation

Current baseline found:
- `global_sections`, `global_section_versions`, `formatting_override`, and `site_formatting_settings` exist in DB migration (`20260220_global_sections_and_formatting.sql`)
- Public renderer already supports local-vs-global published fallback (`lib/cms/get-published-page.ts`)
- Admin has basic global section CRUD page and page editor binding to `global_section_id`
- Missing: lifecycle controls, impact/where-used UX, staged publish workflow, detach/fork semantics, token precedence model, publish gates, full rollback UX, and formal QA automation

---

## 1) Execution Board (Milestones + Dependencies + Acceptance)

## M0 — Foundations / Contract Freeze
**Dependencies:** none  
**Tracks:** Product + Architecture + Dev Lead

### Deliverables
- Freeze V2 data contracts for global lifecycle + token precedence + background styles
- Add explicit enums/types for status, source, gate state, and inheritance
- Create implementation map per repo (`hopfner.dev-admin`, `hopfner.dev`)

### Acceptance Criteria
- Single approved contract doc with DB/API/TS alignment
- No unresolved naming conflicts ("override" vs "token_patch", etc.)
- Open questions list reduced to <= 5 blocking product decisions

---

## M1 — DB Core for Lifecycle + Tokens + Background + Gates
**Dependencies:** M0  
**Tracks:** Backend/DB

### Deliverables
- New migration set (see section 2):
  - lifecycle tables/functions for staged publishes and impact snapshots
  - token layer model + reset-to-inherited support
  - background style schema additions
  - gate results + publish blockers
  - enhanced audit/diff metadata

### Acceptance Criteria
- Migrations run idempotently in staging
- Rollback scripts verified in staging
- RLS and grants updated with no policy regressions
- Existing read paths continue to work (backward-compatible)

---

## M2 — Admin Lifecycle UX (Global Sections)
**Dependencies:** M1  
**Tracks:** Admin FE + API

### Deliverables
- Global section detail page with:
  - draft/publish controls
  - where-used list
  - impact preview (pages + sections affected)
  - staged publish creator + apply/cancel
  - detach/fork action at page section level
- Update page editor chips/state to distinguish:
  - global-inherited
  - global-forked
  - local-only

### Acceptance Criteria
- Admin can publish global draft with gate pass only
- Impact preview before publish is visible and accurate
- Detach creates independent local section snapshot without breaking render
- Fork preserves source linkage metadata for audit trail

---

## M3 — Token Precedence + Reset-to-Inherited + Background Engine
**Dependencies:** M1 (DB), partial M2 for admin controls  
**Tracks:** Admin FE + Public FE

### Deliverables
- Precedence chain implemented and consistent:
  - site defaults -> page override -> global section published token patch -> section override
- Reset actions:
  - per-token reset to inherited
  - per-scope reset (section/page)
- Background style engine:
  - typed token set (color/image/overlay/position/repeat/size/mobile variants)
  - safe rendering transform in public renderer

### Acceptance Criteria
- Same section resolves identical computed tokens in admin preview and public render
- Reset-to-inherited removes patch and rehydrates upstream value
- Invalid token values blocked at validation layer and publish gate

---

## M4 — Validation + Publish Gates + Audit/Diff/Rollback UX
**Dependencies:** M2 + M3  
**Tracks:** Backend + Admin FE

### Deliverables
- Validation engine:
  - JSON schema per section type
  - token schema + background schema
  - cross-field checks (CTA href format, required media fields, etc.)
- Publish gate pipeline:
  - `ready | warning | blocked`
  - persisted gate results
- Audit/diff:
  - side-by-side diff view before publish
  - rollback from version/audit snapshot

### Acceptance Criteria
- Publish cannot proceed when gate status = blocked
- Diff includes content + token + background deltas
- Rollback creates new draft from historical state (non-destructive)

---

## M5 — QA Automation + Release Hardening
**Dependencies:** M2–M4  
**Tracks:** QA + DevOps + Frontend

### Deliverables
- Smoke suite:
  - auth/login
  - page edit + save draft + publish
  - global section staged publish
  - detach/fork flow
  - public render assertions
- Regression matrix by section type + token precedence scenarios
- Release checklist completed (section 5)

### Acceptance Criteria
- CI smoke green on admin + public
- No P1/P2 open defects
- Rollback drill completed and signed off

---

## Dev / QA Handoff Notes (by milestone)
- **Dev M1 handoff:** include SQL migration + TS types + seed/backfill strategy and all function signatures.
- **Dev M2 handoff:** build detail route `/admin/global-sections/[id]`; keep Mantine patterns from existing pages.
- **Dev M3 handoff:** centralize token resolution in shared utility; avoid duplicate precedence logic across components.
- **QA M4 handoff:** start with gate-negative tests first (invalid JSON, forbidden token values, invalid background payloads).
- **QA M5 handoff:** lock golden snapshots for top 3 page templates and run visual diff threshold < 0.5%.

---

## 2) SQL Migration Sequence + Rollback

> Sequence is additive and backward-compatible first; destructive cleanups only after V2 stabilization.

## V2.1 — Lifecycle & linkage metadata
### Up
1. Add to `sections`:
   - `content_source text not null default 'local' check (content_source in ('local','global'))`
   - `forked_from_global_section_id uuid null references global_sections(id)`
   - `detached_at timestamptz null`, `detached_by uuid null`
2. Add to `global_sections`:
   - `publish_mode text not null default 'immediate' check (...)`
3. Create `global_section_usage` materialized view or SQL view for where-used.
4. Create RPC:
   - `publish_global_section_version(p_global_section_id uuid, p_version_id uuid, p_mode text default 'immediate')`
   - `detach_section_from_global(p_section_id uuid)`
   - `fork_section_from_global(p_section_id uuid)`

### Down
- Drop RPCs
- Drop view
- Drop added columns in reverse dependency order

## V2.2 — Staged publish
### Up
1. Create `publish_batches` (`id`, `scope`, `status`, `scheduled_for`, `created_by`, `approved_by`, timestamps)
2. Create `publish_batch_items` (entity references + target version IDs + precomputed impact payload)
3. Add status transitions (`draft`, `scheduled`, `applied`, `cancelled`, `failed`) via check/trigger
4. Add RPC `apply_publish_batch(p_batch_id uuid)`

### Down
- Drop RPC
- Drop batch tables

## V2.3 — Token precedence and reset model
### Up
1. Introduce canonical JSONB columns:
   - `site_formatting_settings.tokens`
   - `pages.token_patch`
   - `global_section_versions.token_patch`
   - `sections.token_patch`
2. Keep existing `formatting_override` temporarily; backfill to `token_patch`
3. Add helper SQL function:
   - `resolve_tokens(p_page_id uuid, p_section_id uuid, p_global_version_id uuid)`
4. Add `token_patch_is_valid(jsonb)` check constraints

### Down
- Remove new constraints/functions
- (Optional) keep columns for non-breaking rollback; otherwise drop token_patch columns post-backfill reversal

## V2.4 — Background style engine
### Up
1. Add `background_style jsonb not null default '{}'` to `section_versions` and `global_section_versions`
2. Add `background_style_is_valid(jsonb)` constraint
3. Add whitelist table for allowed background classes/keys if needed

### Down
- Drop constraints
- Drop columns

## V2.5 — Validation gates + audit enrichments
### Up
1. Create `publish_gate_results` table
2. Add `schema_version` to `section_type_defaults`
3. Add `diff_summary jsonb` to `audit_log`
4. RPC `run_publish_gates(p_entity_type text, p_entity_id uuid, p_version_id uuid)`

### Down
- Drop RPC
- Drop added columns
- Drop gate results table

## Rollback Protocol (operational)
1. Freeze admin publishes (feature flag)
2. Run down migration for latest failing step only
3. Restore latest `cms_content_snapshots` if content drift occurred
4. Re-enable read-only admin mode, verify public render
5. Re-open writes after smoke pass

---

## 3) API / Spec Changes

## Admin API (new/updated)
- `GET /admin/api/global-sections/:id/where-used`
  - returns pages/sections referencing global key + source state
- `POST /admin/api/global-sections/:id/impact-preview`
  - input: `{ versionId }`
  - returns computed page-level diff summary
- `POST /admin/api/global-sections/:id/publish`
  - input: `{ versionId, mode: 'immediate'|'staged', scheduledFor? }`
- `POST /admin/api/sections/:id/detach`
- `POST /admin/api/sections/:id/fork`
- `POST /admin/api/publish-batches/:id/apply`
- `POST /admin/api/publish-gates/run`

## Supabase RPC additions
- `publish_global_section_version(...)`
- `create_publish_batch(...)`
- `apply_publish_batch(...)`
- `detach_section_from_global(...)`
- `fork_section_from_global(...)`
- `run_publish_gates(...)`

## Frontend data contract updates
- `CmsSectionRow`:
  - `content_source`, `forked_from_global_section_id`, `detached_at`
- `CmsSectionVersionRow`:
  - `token_patch`, `background_style`, `gate_status`
- `CmsPublishedSection`:
  - resolved token object + provenance metadata for debug/admin preview

## Non-functional API requirements
- Idempotency key support on staged publish apply
- Deterministic diff payload for audit reproducibility
- Strict validation error shape: `{ code, path, message, severity }`

---

## 4) Risk Register

1. **Dual-source precedence drift (admin preview != public render)**  
   - Mitigation: single shared resolver utility + fixture tests consumed by both repos.

2. **Global publish blast radius mistakes**  
   - Mitigation: mandatory impact preview + staged mode default for globals.

3. **RLS breakage on new tables/RPCs**  
   - Mitigation: policy tests per role (`anon`, `authenticated`, admin) in migration CI.

4. **Rollback complexity with mixed local/global sources**  
   - Mitigation: require snapshot creation before apply; rollback as "new draft" strategy first.

5. **Schema validation false positives blocking editors**  
   - Mitigation: warning mode rollout for first week + telemetry of gate failures.

6. **Performance regression from where-used/diff queries**  
   - Mitigation: indexed lookup columns + precomputed impact summary for batch items.

7. **UI regression vs existing visual language**  
   - Mitigation: keep Mantine component patterns; additive screens not redesign.

---

## 5) Final Release Checklist

## Data & Backend
- [ ] All V2 migrations applied in staging and prod with checksum logged
- [ ] Rollback scripts validated in staging
- [ ] RLS policy verification passed
- [ ] RPC grants verified for admin-only mutations

## Admin UX
- [ ] Global detail page supports draft/publish/where-used/impact
- [ ] Staged publish flow (create/apply/cancel) complete
- [ ] Detach/fork actions confirmed with audit entries
- [ ] Token reset-to-inherited works at field and scope levels

## Public Frontend
- [ ] Resolved token precedence matches admin preview for sample pages
- [ ] Background style engine renders safely and consistently
- [ ] Legacy sections without new fields still render correctly

## Validation & Safety
- [ ] Publish gates block invalid payloads
- [ ] Diff preview shown before publish
- [ ] Rollback from audit/version works end-to-end

## QA & Ops
- [ ] Smoke suite green on CI (admin + public)
- [ ] Regression matrix executed and signed
- [ ] Production rollout plan includes canary + observation window
- [ ] Incident playbook and rollback owner on-call confirmed

---

## Concise Product Decisions Needed (blockers)
1. **Detach semantics:** after detach, should future global publishes be fully ignored forever, or can re-link be allowed?  
2. **Fork semantics:** should fork copy only latest published global version, or allow selecting historical global version as fork base?  
3. **Staged publish approvals:** is single-admin approval enough, or require two-person approval for global changes?
4. **Gate severity model:** should warnings permit immediate publish by default, or require explicit "publish with warnings" confirmation?
5. **Token conflict policy:** when page token patch conflicts with section patch, do we always prioritize lower scope (section) with no exceptions?
