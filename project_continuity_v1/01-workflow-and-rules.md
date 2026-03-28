# Workflow And Rules

## Core Workflow

1. Codex reviews the remote repo over SSH.
2. Codex prepares a strict implementation brief when requested.
3. Opus implements on the server.
4. Codex performs QA and identifies gaps.
5. Repeat in narrow batches.

## Operating Target

- Host: `root@thapi.cc`
- Repo: `/var/www/html/hopfner.dev-main`

## Working Principles

- No soft plans. Every handoff must be execution-ready.
- Prefer one coherent phase at a time.
- Preserve existing behavior unless a brief explicitly changes it.
- Reuse existing workflows and contracts rather than inventing new ones.
- QA must check code paths and run tests/build, not just read a completion report.

## Brief Standard

Every implementation brief should contain:
- exact scope
- exact non-goals
- exact files to change
- implementation order
- source workflows to reuse
- phase gates
- required tests
- completion report requirements

## Current User Preference

- User wants concise, direct collaboration.
- User values no-regression delivery.
- User wants plans and QA, not surprise implementation work.
- User often wants one clear `README.md` entrypoint for Opus.

## Skills / Pattern Already Established

- Remote QA and planning is the default mode for this project.
- The project has many prior handoff folders on the VPS for reference.
- Current naming patterns:
  - `visual-editor_v*`
  - `admin_enhancements_v*`
  - `micro_enhancements_v*`
