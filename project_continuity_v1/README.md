# Hopfner Project Continuity v1

This continuity pack is for fresh Codex sessions working on the `hopfner.dev-main` project.

Primary project:
- Remote host: `root@thapi.cc`
- Repo: `/var/www/html/hopfner.dev-main`

Read in this order:
1. `01-workflow-and-rules.md`
2. `02-current-state.md`
3. `03-active-tracks-and-entrypoints.md`
4. `04-deployment-and-ops-notes.md`

Current active frontend handoff:
- `/var/www/html/hopfner.dev-main/micro_enhancements_v5/README.md`

Current working style:
- Codex does QA/review, architecture mapping, and strict implementation briefs
- Opus implements on the server
- Codex QA checks each batch before the next handoff
- plans must be strict, coding-agent-ready, and phase-gated

Hard rule for fresh sessions:
- do not improvise broad product changes
- inspect the live repo first
- if the user asks for QA, findings come first
- if the user asks for a plan, write a strict runbook and SCP it to the server
