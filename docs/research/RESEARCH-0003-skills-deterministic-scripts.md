# RESEARCH-0003: Deterministic scripts in agent skills

**Researched:** 2026-07-09

**Type:** technical

## Question

Should skills that carry a lot of procedural logic incorporate executable scripts (per Cursor's `scripts/` convention) to make runs more deterministic — and if so, which skills, what kind of scripts, and where should they live?

## Scope and constraints

**In scope:** All 22 Cursor-side skills in `.cursor/skills/`, the repo's existing `scripts/checks/` pattern, ADR-0002's deterministic-enforcement precedent, Cursor official docs on skill `scripts/`, and template spinoff portability (`initialize-project`).

**Out of scope:** Claude-side skills in `docs/claude-skills/` (different runtime), hooks, MCP servers, rewriting skills in this pass, and promoting new CI gates (recommend only).

## Findings

### Current state

| Signal | Value |
| ------ | ----- |
| Cursor skills | 22 in `.cursor/skills/` |
| Skills with a `scripts/` folder | **0** |
| Skills with `reference.md` / `grading.md` | 5 (progressive disclosure only) |
| Heaviest skills by `SKILL.md` line count | `rule-authoring` (201), `audit-seo` (191), `ship-phase` (184), `audit-security` (178), `pre-release-review` (173), `audit-tech-debt` (167) |
| Repo deterministic checks | `scripts/checks/*.mjs` + Vitest, wired through `pnpm check:*` and `pre-push` |

Every skill today is **prose workflow only**: step lists, templates, and judgment criteria the agent interprets each run. None delegate mechanical work to checked-in executables.

`initialize-project` is the only skill that **explicitly calls itself deterministic** ("a deterministic find-and-replace job") — yet it is still entirely agent-executed prose with nine manual idempotency checks.

### Cursor's official model

[Cursor Agent Skills docs](https://cursor.com/docs/skills) and the built-in `create-skill` guidance align on a **split contract**:

- **SKILL.md** — when to run, judgment, templates, escalation
- **`scripts/`** — steps that must run identically every time; referenced by relative path; agent executes via terminal; **script source stays out of context, stdout/stderr enters**

Progressive loading: metadata → full SKILL.md on invoke → scripts/references on demand. Scripts save tokens and reduce "agent reinvents the shell one-liner" variance.

`create-skill` maps **low freedom** tasks (fragile, consistency-critical) to scripts; **high freedom** tasks (context-dependent judgment) stay in prose.

### ADR-0002 is the product-code analogue

[ADR-0002](../adr/ADR-0002-dissolve-locked-rules-enforce-deterministically.md) already decided the template's posture for **invariants**: move enforcement to lint/tests/CI (`check:*`), keep a short mirror in AGENTS.md for plan-time reference. Prompt-level rules and skills are **suggestions**, not guarantees.

**Implication for skills:** not every deterministic step belongs in a skill script. Steps that must **never drift** and apply on every change belong in `scripts/checks/` + CI. Skill scripts are for **workflow-time mechanics** that only run when a skill is invoked — inventories, file moves, scaffold transforms, structured evidence gathering for a human/agent synthesis step that follows.

### What is already scriptable without skills

Several skills re-describe work the repo already centralizes:

| Mechanism | Used by skills that could reference it instead of re-deriving |
| --------- | ------------------------------------------------------------- |
| `pnpm check:*` / `pre-push` | `pre-release-review`, `audit-rules` (hard-constraint overlap) |
| `discoverMarketingRoutes()` / route discovery utils | `sync-repo-docs` (route drift) |
| `pnpm test:ci` | `audit-tests`, `pre-release-review` |
| `rg "// debt:"` | `audit-tech-debt` Phase 2 dimension 10 |

Gap: **no shared "audit orient" or "doc sync evidence" scripts** — each audit skill re-specifies its own shell one-liners (`git log`, `wc`, file globs). That is the highest-variance cluster.

### Skill taxonomy: script candidacy

Audited all 22 skills against two axes: **(A) mechanical repeatability** and **(B) judgment share of the deliverable**.

| Tier | Skills | Script role |
| ---- | ------ | ----------- |
| **A — Mechanical core** | `initialize-project`, `archive-cursor-plans` | Skill-local `scripts/` should own the operation; agent handles preconditions, halt/report, and summary only |
| **B — Evidence gather → synthesize** | `audit-tech-debt`, `audit-tests`, `audit-rules`, `audit-security`, `audit-seo`, `sync-repo-docs` | Shared or per-skill orient scripts emit **structured JSON/Markdown tables**; agent still writes findings, ranking, and recommendations |
| **C — Judgment-primary** | `code-review`, `design-critique`, `ux-copy`, `lexicon-audit`, `research`, `plan-next-epic`, `pre-release-review`, `ship-phase`, workflow meta-skills | Keep prose-first; at most **thin helper scripts** for inventories, not for the verdict |
| **D — Already thin** | `create-migration`, `mark-epic-complete`, `kickoff-phase`, `archive-research`, `github-docs-authoring` | No script payoff at current complexity |

#### Tier A detail

**`initialize-project`** — Nine idempotency predicates and nine write targets are a spec for a script, not a reasoning task. Failure modes today: agent skips a check, misjudges "mixed" state, or paraphrases replacements. A `scripts/run.ts` (or shell) that reads `site.ts` + `README.md` and performs the scrub would match the skill's own stated intent.

**`archive-cursor-plans`** — List root `*.plan.md`, resolve basename collisions (`-2`, `-3`), `git mv` or `mv` to archive. Pure filesystem logic with a small confirmation gate for bulk mode.

#### Tier B detail — what to script vs what to keep agent-side

| Skill step (today) | Scriptable? | Keep agent-side |
| ------------------ | ----------- | --------------- |
| List `.cursor/rules/*.mdc` + frontmatter parse | Yes | Mode-fit / contradiction judgment |
| `git log --stat` churn + largest files | Yes | Architectural mental model paragraph |
| Test file inventory + suffix + colocation map | Yes | Over-testing / assertion-quality calls |
| `rg "// debt:"` harvest | Yes | Severity / effort ranking |
| Migration count, `src/app/` route tree | Yes | Classify drift vs intentional non-update |
| SEO inventory vs `check:seo-base-url` | Partial (check exists) | Standards gaps requiring human read |

**Sync pass** mode (all audit skills): scripts should accept a **finding ID list** and re-verify only cited paths — still mechanical, still script-friendly.

#### Tier C — why not script these

- **`code-review` / `pre-release-review`** — Parallel subagent dispatch and axis grading are orchestration + judgment; scripting the review itself would duplicate CI or produce shallow lint output.
- **`lexicon-audit`** — Term disambiguation and draft definitions need codebase comprehension, not grep alone.
- **`ship-phase` / `plan-next-epic`** — Planning synthesis and doc edits with PM gates; scripts can't own the decisions.

### Where scripts should live (three layers)

| Layer | Path | When |
| ----- | ---- | ---- |
| **CI / invariant** | `scripts/checks/` + `pnpm check:*` | Must hold on every push; referenced from AGENTS.md hard constraints |
| **Skill-local** | `.cursor/skills/<skill>/scripts/` | Invoked only when skill runs; skill-specific file moves or transforms |
| **Shared workflow** | `scripts/workflow/` (new, optional) | Identical orient snippets used by 3+ audit/sync skills — only introduce when second consumer lands |

**Do not** put skill scripts under `src/` — keeps product boundary clean and matches Cursor discovery (relative paths from skill root).

### Risks and mitigations

| Risk | Mitigation |
| ---- | ---------- |
| **Spinoff breakage** — scripts hardcode Seminova paths | Read identity from `site.ts` / env; `initialize-project` script must be template-generic; test on a scrubbed clone |
| **Double maintenance** — SKILL.md and script diverge | SKILL.md says "run `scripts/orient.sh`" once; script owns flags/output schema; skill template documents output format |
| **False confidence** — script passes, judgment skipped | Keep verify gates in prose: "script output is evidence, not the deliverable" |
| **Over-scripting judgment** — brittle heuristics encoded as code | Tier C stays prose; Tier B stops at structured evidence, not auto-findings |
| **Node vs shell split** | Match `scripts/checks/` (`.mjs`, no build) for repo-wide; skill-local can use `tsx` where types help (admin CLI precedent) |

### Token and reliability payoff

Scripts help most when:

1. The same shell pipeline is spelled out in 5+ skills (git churn, file inventories)
2. An agent run **skipped or shortened** a step has caused real drift (`initialize-project` partial scrubs, audit orient shortcuts)
3. Output is **structured** (JSON) so the agent doesn't re-parse filesystem ad hoc

Scripts help least when the deliverable **is** the judgment (reviews, copy, planning).

## Options compared

| Option | Pros | Cons |
| ------ | ---- | ---- |
| **Status quo** — all prose | Zero script maintenance; flexible | High variance between runs; repeated orient logic; `initialize-project` mis-scoped as agent reasoning |
| **Skill-local scripts only** | Cursor-native; progressive load; clear ownership | Duplication across audit skills until shared layer exists |
| **Shared `scripts/workflow/` orient library** | DRY for audit/sync family; one place to fix churn logic | New abstraction; must resist becoming a second product surface |
| **Push everything checkable to CI** | Strongest determinism | Wrong tool for invoke-time workflows (archive plans, template scrub); CI fatigue |
| **Hybrid (recommended)** | Right determinism per layer per ADR-0002 spirit | Requires authoring contract update in `skill-authoring` / `rule-authoring` |

## Recommendation

**Adopt a hybrid model — do not blanket-script all heavy skills.**

### Do now (high confidence, low scope)

1. **`initialize-project`** — Add `.cursor/skills/initialize-project/scripts/` with a dry-run + apply scrub script. SKILL.md shrinks to: preconditions, idempotency gate (script `--check`), invoke script, report. This is the single best ROI case because the skill already claims determinism.

2. **`archive-cursor-plans`** — Add `scripts/archive.sh` (or `.mjs`) for list/move/collision suffix. Keep selective mode resolution and PM confirm in prose.

3. **Authoring contract** — Update skill-authoring guidance (Claude-side `skill-authoring` + Cursor `create-skill` parity note in `.cursor/README.md` if needed): *when a skill repeats the same shell pipeline, extract a `scripts/` helper; when a check must hold on every commit, use `scripts/checks/` + CI instead.*

### Do next (after one real pain run)

4. **Shared orient script** — `scripts/workflow/audit-orient.mjs` (or skill-local copy first): emit JSON with largest files, 6-month churn top-N, `// debt:` markers, migration count. Wire into `audit-tech-debt` and `audit-tests` SKILL.md as Step 1 evidence — not into `audit-rules` until a second run proves the schema.

5. **`sync-repo-docs` evidence script** — Thin wrapper: routes list, migration count, `package.json` scripts diff vs README table — agent still classifies gaps and edits docs.

### Defer / skip

- **Do not script** `code-review`, `design-critique`, `ux-copy`, `lexicon-audit`, `research`, `ship-phase`, `plan-next-epic`.
- **Do not auto-generate findings** in audit skills from scripts — findings stay agent-authored with citations; scripts reduce orient variance only.
- **Do not add skill scripts to CI** — skill scripts are invoke-time; invariants stay in `check:*`.

### Success signal

Revisit scripting breadth when:

- Two agents produce **materially different orient tables** on the same repo snapshot, or
- A **partial `initialize-project`** leaves mixed state again, or
- An audit sync pass marks resolved without re-reading code (scripted verify could narrow file set — optional later).

## Addendum — 2026-08-29: scoping the `initialize-project` script

Recorded while triaging tech-debt work ahead of the first spinoff. Refines **Do now** item 1; does not change the recommendation.

**The scrub is smaller than this brief assumes, and the deletions are bigger.** `src/config/site.ts` centralizes in-app identity — `name`, `description`, `GITHUB_URL`, `Logo` — and everything downstream (page metadata, OG defaults, footer, nav labels) derives from it. Substitution inside `src/` is therefore three values in one file: not a variance risk, and not worth a CLI flag.

The substitution work that *is* large lives outside `src/` — README's pitch, ROADMAP reset, AGENTS.md, LEXICON pruning, `package.json`. But that is rewriting, not string replacement. A script cannot own it, and the agent is not the weak link there either.

**Three categories, not two:**

| Category | Example | Owner |
| -------- | ------- | ----- |
| Deletion | demo route groups, archive contents | **Script** — high volume, zero judgment, silent failure mode |
| Substitution in `src/` | `siteConfig.name`, `description`, `GITHUB_URL` | Agent — one file, three values |
| Edits forced by deletion | `siteConfig.nav` / `footer` entries, `constants/app-paths.ts` exports | **Script — and the actual risk** |

The third category is what a naive `rm -rf` leaves broken. Deleting `/features`, `/reference`, and `/workflow` requires removing their entries from `siteConfig.nav` and from two `siteConfig.footer` columns, and dropping `FEATURES_PATH` / `REFERENCE_PATH` / `WORKFLOW_PATH` from `constants/app-paths.ts`.

**Suggested spec:** delete the named route groups, remove their entries from the registries that reference them, and **fail loudly on any remaining reference it does not recognize** rather than proceeding. That last clause is what makes the script safer than the agent — not the deletion itself.

**Related:** [WORKFLOW_BACKLOG.md › Where the template's demo pages belong](../WORKFLOW_BACKLOG.md#where-the-templates-demo-pages-belong) — whether those pages should ship inside the clone at all. If they move out, this addendum's third category shrinks.

## Open questions

1. **Output schema** — Should shared orient scripts emit JSON (agent-parseable) or Markdown tables (human-readable in chat)? JSON is more deterministic; tables match current audit templates.
2. **`skill-authoring` location** — Convention doc lives Claude-side today; does Cursor need a mirrored `.cursor/skills/skill-authoring/` or a section in `.cursor/README.md`?
3. **Testing skill scripts** — Vitest for `scripts/workflow/` or smoke-only via `pnpm` script? No precedent in repo yet.
4. **Claude skills** — Same split applies to `docs/claude-skills/` (e.g. `phase-planning`, `plan-review`)? Out of scope here but same PM question.

## Sources

- `.cursor/skills/*/SKILL.md` — inventory and workflow steps (2026-07-09)
- `.cursor/skills-cursor/create-skill/SKILL.md` — utility scripts, freedom levels, feedback-loop pattern
- [Cursor Agent Skills docs](https://cursor.com/docs/skills) — `scripts/` directory, execution model
- [ADR-0002](../adr/ADR-0002-dissolve-locked-rules-enforce-deterministically.md) — deterministic enforcement vs prompt guidance
- `package.json` `scripts` + `scripts/checks/` — existing check pattern
- `docs/WORKFLOW_BACKLOG.md` — rules/skills stability item (complementary, not duplicate)

## Related

- [WORKFLOW_BACKLOG.md › Rules & skills: stage-stable guidance vs. direct code references](../WORKFLOW_BACKLOG.md#rules--skills-stage-stable-guidance-vs-direct-code-references) — scripts must stay path-generic for spinoffs
- [WORKFLOW_BACKLOG.md › Cursor capability utilization audit](../WORKFLOW_BACKLOG.md#cursor-capability-utilization-audit) — skill `scripts/` is an underused Cursor capability
- [ADR-0002](../adr/ADR-0002-dissolve-locked-rules-enforce-deterministically.md) — CI layer for invariants
