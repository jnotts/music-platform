# AGENTS.md

## Repo context

Timeboxed (5-hour) Music Demo Submission Platform:

- Public artist submission (no artist login)
- Admin dashboard (authenticated)
- Multi-track uploads w/ progress + ETA
- Audio streaming + waveform
- Realtime admin updates
- Email templates editable in admin + sends
- Background processing for track metadata

## Agent guidelines

- Ship **minimal, working** versions first, then iterate.
- Prefer fewer dependencies and fewer moving parts.
- Don’t invent APIs; if unsure, leave a TODO + safe stub.
- Keep PRs/commits small and reviewable.
- Priorities: end-to-end flow → UX states → polish → nice-to-haves.

## Baseline conventions

- TypeScript everywhere.
- Validate at API boundaries (Zod).
- Consistent API shape:
  - `{ ok: true, data }`
  - `{ ok: false, error: { code, message, details? } }`
- Never hardcode secrets.

## Docs

- Scope/requirements: `docs/PRD.md`
- Stack/tooling: `docs/TECH_STACK.md`
- Setup/env vars: `README.md`

## Prompt logging (assignment requirement)

When an AI assistant is used for non-trivial work:

1. Log the **exact final prompt(s)** in `docs/prompts.md`.
