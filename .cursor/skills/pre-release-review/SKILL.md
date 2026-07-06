---
name: pre-release-review
description: >-
  End-of-feature review before PR: automated gates, scoped code review,
  security pass, hard constraints, and a manual test checklist.
disable-model-invocation: true
---

# Pre-Release Review

Scoped static review before PR. Do not open the browser, and do not change code unless the user asks to fix findings.

## Workflow

```
Pre-release review:
- [ ] Step 1: Automated gates
- [ ] Step 2: Scope changed files
- [ ] Step 3: Does it work? (code review)
- [ ] Step 4: Security
- [ ] Step 5: Project hard constraints (AGENTS.md)
- [ ] Step 6: Conditional passes (errors / a11y / DB)
- [ ] Step 7: Report + manual test checklist
```

### Step 1 — Automated gates (always)

Run in sequence:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
```

Stop if any fail. List failures briefly. Ask whether to fix before continuing.

### Step 2 — Scope (always)

If the user names a feature, use that scope. Otherwise infer scope from `git diff main...HEAD` (or unstaged changes if no branch divergence). Prefer changed application code under `src/`, migrations, and relevant rules — not the whole repo.

State the scope in one line at the top of the report (e.g. "Reviewing settings page — 8 files").

### Step 3 — Does it work? (always, code review)

Read scoped code only.

Check:

1. Logic errors, missed conditions, silent failures
2. Obvious user scenarios — what happens on happy path, empty state, invalid input?
3. Fit with existing project patterns (not one-off approaches)
4. Missing validations on user input
5. If DB touched — queries look correct; no obvious N+1 in new list paths

Skip: linter/style nitpicks, scope creep suggestions, "could be more elegant" feedback.

For each real issue: quote the code, explain failure conditions, suggest a fix. If nothing significant, say so briefly — do not manufacture issues.

Done when every file in scope has been read and checked against 1–5.

### Step 4 — Security (when the feature touches routes, auth, data, API, server actions, or migrations)

Scoped static security review. The criteria live in `.cursor/rules/security.mdc` (stack patterns) and AGENTS.md **Hard constraints** (auth boundary, admin gate, RLS scoping) — read both before judging. This step names the areas to check; those sources own the rules. For whole-repo depth, that's **`audit-security`**, not this step.

Always check scoped code for:

1. **Authentication** — new routes/endpoints gated the way the rest of the app is
2. **Authorization** — no cross-user access or modification by changing an ID or parameter
3. **RLS / ownership** — new or changed tables carry policies matching their intent per AGENTS.md
4. **Input validation** — user input validated before DB queries, file handling, or external calls
5. **Data exposure** — responses and auth errors don't leak fields, internals, or user existence
6. **Secrets** — no keys, tokens, or credentials in client code or committed files

Conditional — when the scoped change touches that surface:

7. **Route boundaries** (new/changed routes, layouts, nav) — every new route aligns with the public-vs-protected list; nothing reachable without the app's auth gate
8. **Storage** (uploads, buckets, signed URLs) — bucket policies scope to the intended owner/role; uploads validated server-side
9. **Privileged access** (admin UI, elevated roles) — role enforced server-side, not client-only; admin actions unreachable by direct URL or API

Prioritize by exploitability (Critical / High / Medium / Low). Done when every scoped file has been checked against every applicable area. If the scoped change has no security surface (e.g. copy-only UI tweak), say "security pass skipped — no auth/data/API changes" and move on.

### Step 5 — Project hard constraints (when feature touches product behavior, data model, auth, or multi-step flows)

Read [AGENTS.md](../../../AGENTS.md) **Hard constraints** (and change protocol). Hard constraints are CI-enforced via `check:*` scripts — this manual pass confirms the scoped change did not disable, bypass, or contradict an enforcement mechanism.

Check scoped code against **whatever hard constraints that section defines** — do not assume domain-specific rules that are not documented there.

Also check generically:

- **Partial failures** — multi-step flows (e.g. external API + DB) fail gracefully without corrupt state
- **Business rule bypass** — ownership checks, required validations, illegal state transitions

If AGENTS.md has no hard constraints section, skip with "no hard constraints documented" unless the user asks for a deeper pass.

Severity: Critical / High / Medium / Low.

### Step 6 — Conditional passes

Run only when the feature touches that area:

**Error handling** (new server actions, API routes, or external/AI calls):

- Swallowed errors, missing UI error states, inadequate logging
- See `.cursor/rules/error-handling.mdc`

**Accessibility** (new or changed UI components):

- Keyboard focus, labels, icon buttons, dialogs, form errors
- See `.cursor/rules/ui-accessibility.mdc`

**DB queries** (new list pages, repositories, or heavy reads):

- N+1, unbounded queries, over-fetching, client-side filtering of large sets
- Ignore micro-optimizations

Skip passes that do not apply — say "skipped (no UI changes)" etc.

### Step 7 — Report

Use this format. Keep it concise — PM-readable.

```markdown
## Pre-release review

**Scope:** [one line]

### Automated gates

- Type-check: Pass / Fail
- Lint: Pass / Fail
- Tests: Pass / Fail

### Findings

#### Security

- [finding or "none / skipped"]

#### Blockers (fix before PR)

- [issue or "none"]

#### Should fix

- [issue or "none"]

#### Defer

- [issue or "none"]

### Manual test checklist

3–5 bullets for the user to click through in the app. Specific to this feature — not generic.

### Docs

- [ ] AGENTS.md / README may need sync — yes/no + why
- [ ] Active PRD may need sync — yes/no + why

If repo docs may be stale, suggest running the **sync-repo-docs** skill.
```

## Principles

- **Tests pass ≠ feature works** — code review catches logic; manual checklist catches UX
- **Scope to the feature** — whole-repo security work belongs to **`audit-security`**
- **Project truth lives in AGENTS.md** — not in this skill file
