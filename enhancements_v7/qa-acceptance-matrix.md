# QA Acceptance Matrix

## Core rule

No design-system control is considered complete until it passes all three layers:

1. persistence
2. resolution
3. rendering

## Matrix

| Token / Preset Class | Saved in backend | Resolved centrally | Rendered consistently | Pass condition |
|---|---|---|---|---|
| theme preset | yes | yes | yes | switching presets changes the whole site coherently |
| section preset | yes | yes | yes | applying preset changes the target section reliably |
| section rhythm | yes | yes | yes | same rhythm creates same cadence across eligible sections |
| section surface | yes | yes | yes | same surface creates same stage treatment across eligible sections |
| content density | yes | yes | yes | same density changes internal padding consistently |
| grid gap | yes | yes | yes | same gap changes layout spacing consistently |
| card family | yes | yes | yes | same family has one consistent identity across eligible sections |
| card chrome | yes | yes | yes | chrome modifier works consistently on top of families |
| divider mode | yes | yes | yes | none/subtle/strong work consistently where supported |
| heading treatment | yes | yes | yes | display/default/mono resolve consistently |
| label style | yes | yes | yes | label treatment resolves consistently |
| composed section support | yes | yes | yes | composed sections honor the shared token model |

## Proof sections to test

Use these sections for QA:

1. `Service Snapshot`
2. `Core Outcomes`
3. `How Engagements Work`
4. `Trust / Proof`
5. `Final CTA`

## Required proof for `Service Snapshot`

The following configuration must create a clear visual difference from the other `card_grid` section:

- preset: `services_snapshot`
- surface: `spotlight_stage`
- family: `service`
- chrome: `elevated`
- density: `airy`
- grid gap: `wide`
- divider mode: `strong`

If that still looks materially similar to `Core Outcomes`, the system is not complete.

