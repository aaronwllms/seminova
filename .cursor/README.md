# Cursor configuration — Seminova

Portable AI workflow for this repo. **Skills-first** — use `/skill-name` in chat.

**What lives here vs elsewhere.** `.cursor/` holds portable Cursor config (rules, skills, subagents, ephemeral plans) — copy or inherit on spinoff. [AGENTS.md](../AGENTS.md) is repo truth (what's implemented, hard constraints, data model). Planning procedure and the full document map live in [docs/DOC_RULES.md](../docs/DOC_RULES.md) — authoritative; not duplicated here. Agent guidance in `.cursor/` is never copied into product code (`src/`).

## What Cursor auto-loads

A small set of **always-on** rules applies in every session (minimalism, PM collaboration, conventions, migration pointer). Other rules **attach by path** when a matching file enters agent context (read, edit, or @-mention) — see [rules/README.md](rules/README.md) for the per-file index. **AGENTS.md** is treated as repo truth by convention; it lives at the repo root, not under `.cursor/`. **Skills** run only when you invoke them (`/plan-next-epic`, `/sync-repo-docs`, etc.). Everything else (WORKFLOW_GUIDE, PRDs, audit artifacts) is read on demand via links or search — not auto-loaded.

## Layout

| Path | Purpose |
| ---- | ------- |
| [`rules/`](rules/) | How to write code (TypeScript, testing, Supabase, security) — auto-loaded by glob |
| [`skills/`](skills/) | User-triggered workflows (`/plan-next-epic`, `/sync-repo-docs`, etc.) |
| [`agents/`](agents/) | Readonly subagents dispatched by skills only (e.g. `/code-review`) — never invoke directly |
| [`plans/`](plans/) | Ephemeral epic plans — not shipped truth |
| [`plans/archive/`](plans/archive/) | Completed epic plans — soft-blocked from @Codebase; still readable on demand |

## Where to look next

| Need | Go to |
| ---- | ----- |
| Full document map (all roles) | [docs/DOC_RULES.md](../docs/DOC_RULES.md) |
| Repo truth, hard constraints, skills catalog | [AGENTS.md](../AGENTS.md) |
| Phase loop, handoffs, planning skills | [docs/WORKFLOW_GUIDE.md](../docs/WORKFLOW_GUIDE.md) |
| Human clone/setup guide | [README.md](../README.md) |

**Sync after shipping:** `/sync-repo-docs` (AGENTS.md + README)

## Skills

Full catalog with when-to-use guidance: [AGENTS.md § Agent skills](../AGENTS.md#agent-skills-cursorskills). Per-skill detail: [`skills/`](skills/) (`SKILL.md` in each folder). Skills with `disable-model-invocation: true` run only when you explicitly invoke them.

## Database migrations

> [!IMPORTANT]
> Agents **write SQL files only**. Humans run `pnpm db:push` and `pnpm db:types`. See [`rules/do-migrations-agent.mdc`](rules/do-migrations-agent.mdc).

## Ignore files (repo root)

Two files at the project root control what Cursor indexes and what agents can read. Full rationale: [RESEARCH-0001](../docs/research/archive/RESEARCH-0001-cursor-ignore-files.md).

| File | Role |
| ---- | ---- |
| [`.cursorignore`](../.cursorignore) | **Hard block** — secrets (env files, keys, credentials). Blocks Agent, Tab, and @-mentions. `.env.example` is explicitly allowed. |
| [`.cursorindexingignore`](../.cursorindexingignore) | **Soft block** — archived plans, frozen docs, and archived research briefs. Hidden from @Codebase search; still readable on demand. |

Do not hard-block `.cursor/rules/`, `.cursor/skills/`, `.cursor/agents/`, or `src/types/database.types.ts`.

## Copying this folder

When porting to another repo: copy `rules/`, `skills/`, `agents/`, and this README; keep repo-root [`.cursorignore`](../.cursorignore) and [`.cursorindexingignore`](../.cursorindexingignore) as the template baseline; adapt hard constraints and doc map in AGENTS.md, ROADMAP.md, and [docs/DOC_RULES.md](../docs/DOC_RULES.md) for that product.
