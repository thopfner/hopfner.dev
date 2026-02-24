# Admin UI Traceability Matrix

Use this matrix to map each finding to affected route/component and a deterministic verification test.

| Finding ID | Finding Summary | Severity | Route | Component(s) | Test Type | Test Reference | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| F-001 | Baseline evidence for dashboard default render was not linked in the gate package. | High | `/` | `app/(admin)/page.tsx`, `components/admin-shell.tsx` | Manual route smoke + artifact capture | `docs/admin-ui-baseline-evidence-index.md#r-01-dashboard-default` | QA Governor | Fixed |
| F-002 | Blog list route had no captured empty-state artifact in Phase 0 evidence bundle. | High | `/blog` | `app/(admin)/blog/page.tsx`, `app/(admin)/blog/page-client.tsx` | Manual state validation + capture command | `docs/admin-ui-baseline-evidence-index.md#r-02-blog-list-empty` | Admin UI Engineer | Fixed |
| F-003 | Global sections route lacked populated-state traceability to a repeatable check. | High | `/global-sections` | `app/(admin)/global-sections/page.tsx`, `app/(admin)/global-sections/page-client.tsx` | Manual regression smoke | `docs/admin-ui-baseline-evidence-index.md#r-03-global-sections-populated` | QA Analyst | Fixed |
| F-004 | Media route evidence did not include upload-modal interaction capture command/output path. | High | `/media` | `app/(admin)/media/page.tsx`, `app/(admin)/media/media-page-client.tsx`, `components/media-library-modal.tsx` | Interaction smoke + console capture | `docs/admin-ui-baseline-evidence-index.md#r-04-media-upload-modal-open` | Admin UI Engineer | Fixed |
| F-005 | Section library route had no documented loading/skeleton verification artifact. | Medium | `/section-library` | `app/(admin)/section-library/page.tsx`, `app/(admin)/section-library/page-client.tsx`, `components/section-editor-drawer.tsx` | Manual loading-state check | `docs/admin-ui-baseline-evidence-index.md#r-05-section-library-loading` | QA Analyst | Fixed |
| F-006 | Page editor route lacked deterministic checklist for validation error + success toast states. | High | `/pages/[pageId]` | `app/(admin)/pages/[pageId]/page.tsx`, `app/(admin)/pages/[pageId]/page-editor.tsx` | Manual form validation + save flow | `docs/admin-ui-baseline-evidence-index.md#r-06-page-editor-validation-and-save` | Admin UI Engineer | Fixed |
| F-007 | Login route baseline did not include invalid-credentials error state evidence link. | Medium | `/login` | `app/(auth)/login/page.tsx`, `app/(auth)/login/login-form.tsx` | Auth negative-path check | `docs/admin-ui-baseline-evidence-index.md#r-07-login-invalid-credentials` | QA Analyst | Fixed |
| F-008 | Setup route baseline was missing first-run success path capture command and output. | Medium | `/setup` | `app/(auth)/setup/page.tsx`, `app/(auth)/setup/setup-client.tsx` | Manual setup flow check | `docs/admin-ui-baseline-evidence-index.md#r-08-setup-first-user-success` | Admin UI Engineer | Fixed |
| F-009 | Forbidden/permission-denied state was required by checklist but absent from evidence index. | High | `/blog`, `/global-sections`, `/media` (read-only role) | `components/admin-shell.tsx` (guard/navigation behavior) | Role/permission manual QA | `docs/admin-ui-baseline-evidence-index.md#r-09-read-only-permission-denied-state` | Security QA | Fixed |
| F-010 | Phase 0 package had no explicit API smoke evidence for priority backend routes used by admin UI. | Medium | `/api/pages/overview`, `/api/media`, `/api/blog/articles`, `/api/content/blueprint` | `app/api/pages/overview/route.ts`, `app/api/media/route.ts`, `app/api/blog/articles/route.ts`, `app/api/content/blueprint/route.ts` | CLI API smoke (curl) | `docs/admin-ui-baseline-evidence-index.md#r-10-priority-api-smoke` | QA Governor | Fixed |

## Rules
- Every remediation PR must reference at least one **Finding ID**.
- `Status` lifecycle: `Open -> In Progress -> Fixed -> Verified -> Closed`.
- A finding is **Verified** only when linked test(s) pass in target environment.
- No phase gate pass if any High severity finding lacks test linkage.
