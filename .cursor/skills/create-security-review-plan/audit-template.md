# Security Audit — Cookloop

<!-- Live file: SECURITY_AUDIT.md at repo root -->

**Live file:** `SECURITY_AUDIT.md` (repo root) — archive snapshots → `archive/security-audits/` via `/archive-security-audit`

**Generated:** YYYY-MM-DD

**Scope:** Full repo static review | [or narrow scope if quick scan]  
**Produced by:** `/create-security-review-plan` → **Build in parallel**  
**Surfaces inventoried:** [e.g. N routes, M server actions, T tables with RLS, S storage buckets]

## Surface map

| Surface            | Count | Key paths |
| ------------------ | ----- | --------- |
| Routes & layouts   |       |           |
| Server actions     |       |           |
| API routes         |       |           |
| DB / RLS           |       |           |
| Storage            |       |           |
| Admin / privileged |       |           |

---

## Execution plan (Multitask)

Workstreams executed via **Build in parallel** on the security review plan. Read-only; no application code edits.

### W1 — Auth & routing

**Status:** pending | in progress | done

**Files:**

- …

**Review checklist:**

- [ ] …

**Agent prompt:**

```text
[paste-ready prompt for one agent]
```

### W2 — Data layer

**Status:** pending

**Files:** …

**Review checklist:** …

**Agent prompt:** …

### W3 — Server surface

**Status:** pending

**Files:** …

**Review checklist:** …

**Agent prompt:** …

### W4 — Storage

**Status:** pending

**Files:** …

**Review checklist:** …

**Agent prompt:** …

### W5 — Exposure & secrets

**Status:** pending

**Files:** …

**Review checklist:** …

**Agent prompt:** …

---

## Findings

### Critical

- [ ] **Title** — `path/to/file.ts`
  - **Issue:** …
  - **Scenario:** …
  - **Remediation hint:** …

### High

- [ ] …

### Medium

- [ ] …

### Low

- [ ] …

### Deferred / accepted risk

- [ ] …

---

## Verified OK

- …

## Human / tooling follow-ups

- [ ] Run `pnpm audit` for dependency CVEs
- [ ] Manual IDOR testing (second user account)
- [ ] …
