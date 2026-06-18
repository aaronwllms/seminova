---
name: pre-release-review
description: >-
  End-of-feature review before PR: run quality gates, security check, project
  locked rules from AGENTS.md, scoped code review, and a manual test checklist.
  Use when finishing an epic, before opening a PR, or when the user asks for a
  pre-release or ship review.
disable-model-invocation: true
---

# Pre-Release Review

Scoped review before PR. Do not change code unless the user asks to fix findings.

If the user names a feature, use that scope. Otherwise infer scope from `git diff main...HEAD` (or unstaged changes if no branch divergence).

## Workflow

```
Pre-release review:
- [ ] Step 1: Automated gates
- [ ] Step 2: Scope changed files
- [ ] Step 3: Does it work? (code review)
- [ ] Step 4: Security
- [ ] Step 5: Project locked rules (AGENTS.md)
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

Identify files to review from the feature scope or diff. Prefer changed application code under `src/`, migrations, and relevant rules — not the whole repo.

State the scope in one line at the top of the report (e.g. "Reviewing settings page — 8 files").

### Step 3 — Does it work? (always, code review)

Read scoped code only. This is **static review**, not browser testing.

Check:

1. Logic errors, missed conditions, silent failures
2. Obvious user scenarios — what happens on happy path, empty state, invalid input?
3. Fit with existing project patterns (not one-off approaches)
4. Missing validations on user input
5. If DB touched — queries look correct; no obvious N+1 in new list paths

Skip: linter/style nitpicks, scope creep suggestions, "could be more elegant" feedback.

For each real issue: quote the code, explain failure conditions, suggest a fix. If nothing significant, say so briefly — do not manufacture issues.

### Step 4 — Security (always when feature touches routes, auth, data, API, server actions, or migrations)

Scoped static security review. Read `.cursor/rules/security.mdc` for patterns. Read AGENTS.md **Auth and routing** and **Row Level Security** locked rules when those areas are in scope.

Check:

1. **Authentication** — new routes/endpoints require auth when they should; middleware/auth proxy boundary respected (discover from repo — often `src/supabase/proxy.ts`, `src/middleware.ts`, or equivalent)
2. **Authorization** — user cannot access or modify another user's data by changing an ID or parameter
3. **RLS / ownership** — new or changed tables have appropriate policies; user-owned vs shared-catalog scope matches AGENTS.md locked rules (not only `user_id = auth.uid()` when the table is shared or scoped via FK)
4. **Input validation** — user input validated before DB queries, file uploads, or external API calls (Zod on API inputs per project rules)
5. **Data exposure** — responses do not leak fields the client does not need; auth errors do not reveal user existence or internal details
6. **Secrets** — no API keys, tokens, or credentials in client code or committed files; service role key never in client or `NEXT_PUBLIC_*` env vars

**Conditional — run when the scoped change touches that surface:**

7. **Route boundaries** (new/changed routes, layouts, or nav links) — every new product route aligns with AGENTS.md public vs protected list; no page reachable without the auth gate the rest of the app uses
8. **Storage** (file uploads, Storage buckets, or signed URLs) — bucket policies restrict read/write to the owning user (or intended role); uploads validated server-side (type, size, path); no world-writable buckets
9. **Privileged access** (admin UI, elevated roles, or catalog mutations) — role enforced server-side (e.g. JWT `app_metadata` per AGENTS.md), not client-only; non-admins cannot hit admin actions by URL or API directly

Prioritize by exploitability (Critical / High / Medium / Low). If the scoped change has no security surface (e.g. copy-only UI tweak), say "security pass skipped — no auth/data/API changes" and move on.

Do not invent issues. If solid, say so briefly.

### Step 5 — Project locked rules (when feature touches product behavior, data model, auth, or multi-step flows)

Read [AGENTS.md](../../../AGENTS.md) **Locked rules** (and change protocol). Check scoped code against **whatever locked rules that file defines** — do not assume domain-specific rules that are not documented there.

Also check generically:

- **Partial failures** — multi-step flows (e.g. external API + DB) fail gracefully without corrupt state
- **Business rule bypass** — ownership checks, required validations, illegal state transitions

If AGENTS.md has no locked rules section, skip with "no locked rules documented" unless the user asks for a deeper pass.

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

3–5 bullets for the PM to click through in the app. Specific to this feature — not generic.

### Docs

- [ ] AGENTS.md / README may need sync — yes/no + why
- [ ] Planning brief may need sync — yes/no + why

If docs may be stale, suggest running **sync-repo-docs** and/or **sync-context-md** skills.
```

## Principles

- **Tests pass ≠ feature works** — code review catches logic; manual checklist catches UX
- **Do not open the browser** unless the user explicitly asks
- **Do not fix code** without permission
- **Scope to the feature** — avoid whole-repo audits (use **create-security-review-plan** + Build for full-repo audits)
- **Project truth lives in AGENTS.md** — not in this skill file
