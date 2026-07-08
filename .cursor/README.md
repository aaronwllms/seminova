# Cursor configuration — Seminova

Portable AI workflow for this repo. **Skills-first** — use `/skill-name` in chat.

## Layout

| Path | Purpose |
| ---- | ------- |
| [`rules/`](rules/) | How to write code (TypeScript, testing, Supabase, security) — auto-loaded by glob |
| [`skills/`](skills/) | User-triggered workflows (`/plan-next-epic`, `/sync-repo-docs`, etc.) |
| [`plans/`](plans/) | Ephemeral epic plans — not shipped truth |

## Planning & repo truth

| Doc | Audience | Role |
| --- | -------- | ---- |
| [ROADMAP.md](../ROADMAP.md) | PM + agents | Phase status, planning horizon stubs |
| [docs/prds/](../docs/prds/) | PM + agents | Active-phase build scope (epics/stories) |
| [docs/archive/CONTEXT_ARCHIVE.md](../docs/archive/CONTEXT_ARCHIVE.md) | PM + agents (on demand) | Frozen shipped narratives (read-only) |
| [AGENTS.md](../AGENTS.md) | Agents | Hard constraints, what's implemented, data model summary |

**Sync after shipping:** `/sync-repo-docs` (AGENTS.md + README)

**Full workflow:** [docs/WORKFLOW_GUIDE.md](../docs/WORKFLOW_GUIDE.md) — phases, handoffs, and planning skills.

## Common skills

| Skill | When |
| ----- | ---- |
| `/plan-next-epic` | Plan Mode — next uncompleted epic from CONTEXT + AGENTS |
| `/sync-repo-docs` | After behavior/routes/schema changes |
| `/create-migration` | New Supabase migration SQL (human runs `pnpm db:push`) |
| `/pre-release-review` | Before opening a PR |
| `/audit-tech-debt` | Debt assessment (full pass or sync) → `TECH_DEBT_AUDIT.md` |
| `/audit-security` | Security audit (full pass or sync) → `SECURITY_AUDIT.md` |

See [`skills/`](skills/) for full list. Skills with `disable-model-invocation: true` run only when you explicitly invoke them.

## Database migrations

> [!IMPORTANT]
> Agents **write SQL files only**. Humans run `pnpm db:push` and `pnpm db:types`. See [`rules/do-migrations-agent.mdc`](rules/do-migrations-agent.mdc).

## Copying this folder

When porting to another repo: copy `rules/`, `skills/`, and this README; adapt hard constraints and doc map in AGENTS.md, ROADMAP.md, and [docs/DOC_RULES.md](../docs/DOC_RULES.md) for that product.
