# Admin UI Traceability Matrix

Use this matrix to map each finding to affected route/component and a deterministic verification test.

| Finding ID | Finding Summary | Severity | Route | Component(s) | Test Type | Test Reference | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| F-001 | Placeholder for route render failure | High | `/admin/...` | `...` | Smoke E2E | `tests/e2e/...` | TBD | Open |
| F-002 | Placeholder for broken primary action | High | `/admin/...` | `...` | Interaction E2E | `tests/e2e/...` | TBD | Open |
| F-003 | Placeholder for table/filter mismatch | Medium | `/admin/...` | `...` | Component + E2E | `tests/...` | TBD | Open |
| F-004 | Placeholder for responsive layout break | Medium | `/admin/...` | `...` | Visual/viewport | `tests/visual/...` | TBD | Open |
| F-005 | Placeholder for permission-state mismatch | High | `/admin/...` | `...` | Auth/role test | `tests/e2e/...` | TBD | Open |

## Rules
- Every remediation PR must reference at least one **Finding ID**.
- `Status` lifecycle: `Open -> In Progress -> Fixed -> Verified -> Closed`.
- A finding is **Verified** only when linked test(s) pass in target environment.
- No phase gate pass if any High severity finding lacks test linkage.
