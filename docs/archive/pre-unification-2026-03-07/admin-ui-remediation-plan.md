# Admin UI Remediation Plan (Phase 0 Governance)

## Objective
Stabilize and accelerate admin UI remediation through phased, testable delivery with strict gates and rollback controls.

## Scope
- **In scope:** planning, inventory, baseline capture, traceability, phase gates, QA criteria, release/rollback approach.
- **Out of scope (Phase 0):** product code changes, visual redesign, feature additions.

## Delivery Phases
1. **Phase 0 — Governance & Baseline (this deliverable)**
   - Define remediation process, ownership, and acceptance gates.
   - Build finding-to-test traceability matrix.
   - Define baseline capture checklist (routes/viewports/states).
2. **Phase 1 — Instrumentation & Reproducibility**
   - Ensure deterministic local/staging runs.
   - Establish route-level smoke scripts and artifacts.
3. **Phase 2 — High-Severity Remediation**
   - Fix blocking/broken routes and critical interaction failures.
4. **Phase 3 — Medium/Low Remediation & Consistency**
   - Resolve non-blocking defects and consistency gaps.
5. **Phase 4 — Hardening & Sign-off**
   - Full regression sweep, docs refresh, release readiness.

## Operating Model
- Work in small PRs mapped to traceability IDs.
- Every fix must reference: finding ID, route, component, and verification test.
- No phase advance without gate sign-off.

## Risks & Mitigations
- **Risk:** Hidden regressions across shared components.  
  **Mitigation:** route smoke coverage + component ownership review.
- **Risk:** Inconsistent environments causing false negatives.  
  **Mitigation:** pinned env config + reproducible scripts.
- **Risk:** Scope creep during remediation.  
  **Mitigation:** phase gate template + explicit out-of-scope log.
- **Risk:** Delayed rollback during bad deploy.  
  **Mitigation:** documented rollback triggers and owner on-call.

## Rollback Strategy
- **Trigger conditions:** failed gate checks, severe UX break, auth/permission regression, or error-rate spike.
- **Method:** revert offending commits/PR set; redeploy last known good build.
- **Validation:** rerun baseline smoke set on priority routes before reopening phase.
- **Ownership:** release owner + QA approver confirm rollback completion.

## Gate Policy
- Each phase must pass **Entry**, **Execution**, and **Exit** checks (see `admin-ui-phase-gate-template.md`).
- Evidence required: linked tests, screenshots/logs, and traceability matrix updates.
- Gate decisions: **Pass / Conditional Pass / Fail** with named approver.
