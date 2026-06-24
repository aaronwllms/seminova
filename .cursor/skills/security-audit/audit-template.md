# Security Audit — <repo name>

<!-- Live file: SECURITY_AUDIT.md at repo root -->

**Live file:** `SECURITY_AUDIT.md` (repo root) — archive snapshots → `archive/security-audits/` via `/archive-security-audit`

**Generated:** YYYY-MM-DD

**Scope:** Full repo static review | [or narrow scope if quick scan]  
**Produced by:** `/security-audit`  
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

## Workstreams reviewed

Read-only review across the five workstreams. No application code edits.

### W1 — Auth & routing

**Status:** done | scoped out

**Files reviewed:**

- …

**Checklist:**

- [ ] …

### W2 — Data layer / RLS

**Status:** done

**Files reviewed:** …

**Checklist:** …

### W3 — Server surface

**Status:** done

**Files reviewed:** …

**Checklist:** …

### W4 — Storage

**Status:** done

**Files reviewed:** …

**Checklist:** …

### W5 — Exposure & secrets

**Status:** done

**Files reviewed:** …

**Checklist:** …

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
