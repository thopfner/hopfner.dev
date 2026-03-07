# Admin UI Phase Gate Template

Use this template for each remediation phase review.

## Phase Metadata
- **Phase:**
- **Window:**
- **Lead:**
- **QA Approver:**
- **Release Owner:**

## Entry Criteria (must all be true)
- [ ] Phase scope is documented and frozen.
- [ ] Findings mapped in traceability matrix.
- [ ] Required environments available and healthy.
- [ ] Test plan and owners assigned.
- [ ] Rollback path confirmed.

## Execution Checks
- [ ] All in-scope findings moved at least to `Fixed` with linked PRs.
- [ ] Required automated tests passing.
- [ ] Manual QA checks completed for priority routes.
- [ ] No unresolved blocker defects introduced.
- [ ] Documentation updated (matrix, evidence links, known issues).

## Exit Criteria (gate decision)
- [ ] All High severity in-scope findings are `Verified` or explicitly deferred with approval.
- [ ] Regression smoke suite passes.
- [ ] Baseline deltas reviewed and accepted.
- [ ] Rollback rehearsal/check validated.
- [ ] Stakeholder sign-off recorded.

## QA Pass Criteria
- Functional correctness on targeted routes.
- No critical console/network errors in validated flows.
- Role/permission behavior matches expected access model.
- Responsive behavior acceptable on required viewports.

## Gate Decision
- **Decision:** Pass / Conditional Pass / Fail
- **Conditions (if any):**
- **Approver:**
- **Date:**
- **Evidence Links:**
