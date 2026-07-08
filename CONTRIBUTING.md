# Contributing to Seminova

Thanks for your interest in improving Seminova. This guide covers what kinds of contributions fit, how to get set up, and the quality bar every change must clear.

---

## What fits (and what doesn't)

Seminova is an opinionated _template_, not a product. Contributions that fit:

- **Template foundations** — UI primitives, accessibility defaults, token architecture, Supabase/auth wiring, tooling and CI
- **The agent workflow** — improvements to the planning skills, Cursor rules, and workflow documentation
- **Documentation** — clarity fixes anywhere; if a setup or workflow step confused you, that's a bug worth reporting or fixing
- **Bug fixes** — anything broken in the template as shipped

Contributions that don't fit:

- **Product features** — billing, teams, notifications, and similar belong to individual products built _from_ Seminova, not to the template
- **Visual identity changes** — colors, type, and radius are per-product by design; changes to the _token architecture_ are welcome, changes to Seminova's particular theme generally aren't

Not sure which side an idea falls on? [Open an issue](https://github.com/aaronwllms/seminova/issues) and ask before investing in a PR.

---

## Getting set up

Follow the [README Quick start](README.md#quick-start) — clone, install with pnpm, configure Supabase, run the dev server. Prerequisites (Node version, pnpm, Supabase project) are listed there.

---

## Quality bar

Every PR must pass the same checks CI runs. Before pushing:

```bash
pnpm pre-push
```

This runs, in order: `type-check` → hard-constraint checks → `lint` → `format-check` → `test:ci` (with 80% coverage thresholds). It mirrors CI exactly — if it passes locally, CI should pass too. See [README](README.md#contributing-and-quality) or [AGENTS.md](AGENTS.md) for the full script list.

Husky enforces most of this automatically:

- **Pre-commit** — lint-staged (ESLint + Prettier on staged files) plus a full-project type-check
- **Pre-push** — the full `pnpm pre-push` sequence

> [!IMPORTANT]
> Don't bypass hooks with `--no-verify`; a PR that fails CI won't be merged.

---

## Conventions

The repo's standards live in the repo, not in this file:

- [AGENTS.md](AGENTS.md) — repo truth and **hard constraints** (non-negotiable, enforced by `check:*` scripts and CI)
- [.cursor/rules/](.cursor/rules/) — coding standards and conventions
- [DESIGN.md](DESIGN.md) — token architecture and design-system rules
- [docs/DOC_RULES.md](docs/DOC_RULES.md) — document roles and maintenance procedure, if your change touches them

If you build with AI coding tools, the rules and skills in `.cursor/` are loaded automatically in Cursor. If you write by hand, the same constraints apply — CI checks them either way.

---

## Database migrations

Schema changes are SQL files in [`supabase/migrations/`](supabase/migrations/) — write the migration file, don't apply it. See [AGENTS.md](AGENTS.md) and [.cursor/rules/do-migrations-agent.mdc](.cursor/rules/do-migrations-agent.mdc).

> [!WARNING]
> **Applying migrations is a human step** — `pnpm db:push` is done by the person reviewing or merging, not the PR author.

---

## Pull requests

- [ ] Branch off `main`
- [ ] Keep PRs small and focused — one concern per PR
- [ ] Run `pnpm pre-push` before pushing
- [ ] Describe _why_, not just _what_ — especially for anything touching template opinions

CI runs on every PR to `main`. Merge requires green CI.

---

## Reporting issues

[Open an issue](https://github.com/aaronwllms/seminova/issues) for bugs, rough edges, or unclear docs. Confusing workflow documentation counts as a bug — the template's value depends on its docs being followable by someone who didn't write them.

---

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE) that covers the project.
