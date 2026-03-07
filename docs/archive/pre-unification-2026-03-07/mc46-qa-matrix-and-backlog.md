# MC-46 — QA Matrix, Browser/Device Matrix, LOE, and Execution Backlog

## 1) QA checklist mapped to MC-41 acceptance criteria

### A. Compact responsive behavior (prototype and implementation)
- [ ] Desktop (>=1366): Search + Controls + Add section visible without overlap.
- [ ] Tablet (~768): controls remain tappable and readable; no clipping.
- [ ] Mobile (<=375): stacked rows preserve Add section visibility and prevent toolbar/card collision.
- [ ] Sort dropdown width respects viewport cap and remains fully readable.
- [ ] Filters panel/modal dimensions respect viewport and keep action footer reachable.

### B. Accessibility and keyboard behavior
- [ ] Controls trigger exposes `aria-haspopup`, `aria-expanded`, `aria-controls`.
- [ ] Search has consistent accessible name (`aria-label` or linked visible label).
- [ ] Menu/panel closes on Esc and returns focus to invoker.
- [ ] Keyboard path supports open/select/apply/clear/end-to-end without dead-end.
- [ ] Focus order is deterministic (search -> controls -> menu/panel controls -> actions).

### C. Non-regression constraints from MC-41 baseline
- [ ] Add section CTA never hidden in default states.
- [ ] Section card metadata remains unobstructed.
- [ ] Sticky toolbar does not occlude overlays.
- [ ] Header/nav interactions remain unaffected.

## 2) Browser/device matrix

| Surface | Browser | Viewport/device | Coverage |
|---|---|---|---|
| Desktop | Chrome latest | 1440x900 | Baseline toolbar density + overlay fit |
| Desktop | Firefox latest | 1366x768 | Menu/dialog sizing + keyboard nav |
| Tablet | Safari iPad (or emu) | 768x1024 | Wrap behavior + action reachability |
| Mobile | Chrome Android (or emu) | 375x812 | Two-row compact layout, add CTA visibility |
| Mobile | Safari iPhone (or emu) | 375x667 | Bottom-sheet/dialog usability + focus/close |

## 3) LOE estimate

Overall LOE: **Medium**

- UI implementation (toolbar control refactor + responsive behavior): **M**
- A11y hardening + keyboard semantics: **S/M**
- QA + polish + regression fixes: **M**

Estimated execution envelope (engineering): **2–3 focused UI cycles**

## 4) Sequenced follow-up execution backlog (for ui-dev)

1. **MC-41-Exec-1: Toolbar structure refactor**
   - Introduce compact Controls trigger pattern and mobile two-row layout.
2. **MC-41-Exec-2: Overlay behavior + sizing tokens**
   - Wire menu/dialog/sheet constraints and overflow/z-index rules.
3. **MC-41-Exec-3: A11y/keyboard compliance**
   - Apply explicit ARIA attributes and focus-return/escape semantics.
4. **MC-41-Exec-4: Visual regression sweep**
   - Validate no overlap with Add section and card metadata across breakpoints.
5. **MC-41-Exec-5: Final QA + review package**
   - Capture evidence matrix and ship review-ready report.

## 5) Prototype artifact linkage
- Prototype file: `docs/mc46-sections-controls-prototype.html`
- Recommended pattern represented: **Option B (Dropdown-based utility controls)**
