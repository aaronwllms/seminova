# Sync planning brief — reference

## Document roles

See [DOC_RULES.md](../../../DOC_RULES.md) for the canonical document-roles table and sync order.

## Generic section map (adapt to your brief's headings)

| Section type             | Update when…                                                        |
| ------------------------ | ------------------------------------------------------------------- |
| **Last updated**         | Any content edit in the planning brief                              |
| **Status**               | Phase completion or phase work officially started                   |
| **Vision / positioning** | Core product positioning changes (**PM approval**)                  |
| **Target user**          | Persona or constraints change (**PM approval**)                     |
| **Shipped summary**      | Routes, nav, features, auth boundary, DB — mirror AGENTS.md shipped |
| **Locked rules**         | Mirror a locked-rule change already made via AGENTS.md change protocol — never initiate |
| **Tech stack**           | New major tool committed to a phase                                 |
| **Roadmap**              | Phase status badge changes (**approval** for status promotions)     |
| **Future-phase detail**  | PM adds/refines epics or stories — keep draft until phase is active |
| **Open questions**       | Decision made, deferred further, or new question opened             |

## Audit checklist (by change type)

### Shipped feature (UI/behavior)

- [ ] Planning brief → shipped summary bullet
- [ ] AGENTS.md → implemented section (via sync-repo-docs if needed)
- [ ] Skip future-phase sections unless feature is explicitly later-phase scope

### New product route or nav change

- [ ] Planning brief → shipped summary → routes / nav
- [ ] AGENTS.md → product routes
- [ ] Locked rules only if auth boundary changed

### Phase marked complete

Per [DOC_RULES.md](../../../DOC_RULES.md) rule 6:

- [ ] `CONTEXT_ARCHIVE.md` → append `## Phase N` block (epic bullets from ACTIVE)
- [ ] `CONTEXT.md` → status line + roadmap row → `Complete`
- [ ] `CONTEXT.md` → remove shipped ACTIVE stories (or replace ACTIVE with next phase pointer)
- [ ] `CONTEXT.md` → do NOT retain inline ARCHIVE section

### Phase work started (future phase)

- [ ] Planning brief → status line
- [ ] Planning brief → roadmap badge → `In progress` (**approval**)
- [ ] Do not rewrite shipped summary unless current phase regressed

### PM decision on open question

- [ ] Planning brief → open questions — remove, resolve, or re-defer
- [ ] If decision affects locked rules → mirror via AGENTS.md change protocol (never initiate)

### Planning session output (new stories/epics)

- [ ] Planning brief → future-phase detail (draft stories / concepts)
- [ ] Do not add to shipped summary until code ships

### Database migration

- [ ] CONTEXT.md → header migration count + section 7 planning notes (buckets, RPCs) if changed
- [ ] AGENTS.md → data model summary (sync-repo-docs) — authoritative table/column detail
- [ ] Do not restore per-table schema tables in CONTEXT.md

### Internal refactor only

- [ ] No planning brief update. Report "Left unchanged."

## Evidence commands

```bash
git log --oneline -20
git diff main...HEAD --stat
git diff --stat
git status
ls supabase/migrations/
ls src/app/
```

Read AGENTS.md shipped and locked-rules sections for cross-check.

## Examples

### Example A — Feature shipped (behavior change)

**Evidence:** AGENTS.md lists new capability; commits touch feature components.

**Updates:**

- Planning brief → shipped summary bullet (if missing or stale)
- Planning brief → Last updated
- AGENTS.md already current → no sync-repo-docs needed

**Skip:** Future-phase sections.

### Example B — PM resolves an open question

**Evidence:** Conversation — decision made or deferred with new wording.

**Updates:**

- Open questions section: update or remove per decision
- If locked rules affected → mirror via AGENTS.md change protocol (never initiate)

### Example C — Plan file only, not implemented

**Evidence:** `.cursor/plans/*.plan.md` exists; no matching routes/code.

**Updates:** None. Report "Left unchanged — plan-only, not shipped."

### Example D — Auth default or public route changed

**Evidence:** Auth middleware/proxy redirect change.

**Updates (after locked-rule change made via change protocol):**

- Planning brief → shipped summary → routes
- Mirror locked-rule change in planning brief (never initiate)
- AGENTS.md → locked rules → auth (via sync-repo-docs, mirror-only)

## Discovering the planning brief

1. AGENTS.md documentation map → `CONTEXT.md` + `CONTEXT_ARCHIVE.md`
2. Else: root `CONTEXT.md` + `CONTEXT_ARCHIVE.md` when present (exclude `node_modules`)
3. Document the canonical paths in AGENTS.md documentation map when settled

### Example E — Phase marked complete

**Evidence:** PM confirms Phase 12 shipped; ACTIVE has epic bullets; AGENTS.md updated.

**Updates (in order)** — per [DOC_RULES.md](../../../DOC_RULES.md) rule 6:

1. `CONTEXT_ARCHIVE.md` → append `## Phase 12 — …` with epic bullets from ACTIVE
2. `CONTEXT.md` → Status line and roadmap row → `Complete`
3. `CONTEXT.md` → clear ACTIVE or point to next Draft phase
4. Both files → bump Last updated

**Skip:** Do not edit existing archive phase sections. Do not add `# ARCHIVE` to `CONTEXT.md`.
