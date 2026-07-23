# PRD — Phase 16: Motion System & Table Fetch Feedback

**Status:** `Active`
**Last updated:** 2026-07-23

---

## Problem

Hover and state transitions across the app run on Tailwind's implicit 150ms default with no stated rationale — marketing cards, stat tiles, table rows, and nav links all transition identically regardless of how they are actually used, and nothing stops a new component from inventing another one-off value. Motion is the one design-system dimension with no token representation: every other themeable value resolves through `globals.css`, but timing is scattered as implicit defaults across the call sites that declare a transition.

Separately, the logs and users admin tables dim to 60% opacity on every fetch with no minimum duration, so a fast response can start the fade and reverse it mid-flight, reading as a flicker rather than a transition.

This PRD was fully grilled in a planning chat before decomposition into epics/stories.

## Goal

Add motion duration tokens to the existing token layer, define a two-tier system keyed on traversal rate, apply it across existing call sites, and enforce tier correctness with a custom ESLint rule. Separately, give the table refetch dim a minimum duration so it always completes a full cycle, with that logic shared across both admin tables rather than duplicated.

The organizing principle: **duration follows traversal rate** — how many of a surface the cursor sweeps across per second — not element size or importance. Surfaces traversed in bulk (nav, links, table rows, filter buttons) need speed or they smear; surfaces approached one at a time (marketing cards) can afford a softer fade.

## Out of scope

- **Enter/exit animations** (dialogs, sheets, accordions) and **layout animations** (sidebar collapse) — owned by the vendored shadcn/Radix primitives; retuning them is churn against upstream with no user-visible payoff here.
- **`src/components/ui/` as lint scope** — vendored shadcn source, excluded from the rule, matching the exclusion the existing `semantic-tokens` rule already uses. Two files inside it are hand-edited once as deliberate exceptions.
- **Easing tokens** — perceptually irrelevant on color transitions at these durations; including them would add a decision point per call site that buys nothing.
- **Elevating motion to a hard constraint** — this is a coding standard, homed in `.cursor/rules/` with ESLint as its enforcement, not an addition to AGENTS.md § Hard constraints. Every constraint on that list is load-bearing for safety or the re-skin architecture; motion timing is consistency.
- **Buffering fetched rows to delay the data swap** — the dim's minimum duration alone resolves the flicker. Holding data back would add state and delay fresh results for no gain.
- **Layout transitions** — transitions that animate layout (width, height, position) rather than element state are outside the tier system, consistent with the sidebar-collapse exclusion above. The admin shell header's `transition-[width,height]` is the one in-scope call site of this kind: it keeps its current timing and takes an inline rule exemption rather than a tier.
- **A focus / focus-visible instant carve-out** — exempting focus-ring transitions from the tier system so keyboard traversal is instant was raised during planning and deferred; the rule applies uniformly to focus states in this phase. Tracked in ROADMAP open questions.

---

## Epics & stories

### Epic 1: Motion tier system `Complete`

- **1.1 Motion durations become themeable tokens.** Two duration tokens are defined in `globals.css` alongside the existing token layer, generating a `swept` (150ms) and a `dwell` (300ms) duration utility. DESIGN.md gains a Motion section stating the traversal-rate principle, what each tier covers, the scope boundary (state transitions on persistent elements only — not enter/exit or layout animation), and the rationale for excluding `src/components/ui/`. LEXICON.md gains a "Motion tier" architectural entry pointing to DESIGN.md as its canonical home, carrying no values of its own.

- **1.2 Existing transitions adopt their tier, and the tier is enforced.** Every bare `transition-*` utility outside `src/components/ui/` gains its tier utility — Swept for cursor-swept surfaces (nav links, breadcrumb, footer links, marketing CTAs, table rows, stat tile filters, admin dashboard cards, the tabs active indicator), Dwell for dwell surfaces (`MarketingDisplayCard`). Enumerate the call sites from the codebase at build time rather than working from a fixed count. A custom ESLint rule requires any `transition-*` utility to carry one of the two tier utilities, scoped to `src/**` excluding `src/components/ui/`, following the structure the existing `semantic-tokens` rule already establishes. A `.cursor/rules/` entry documents the standard so it is applied at authoring time rather than caught at CI. `src/components/ui/table.tsx` and `src/components/ui/tabs.tsx` are hand-edited once despite that directory being lint-excluded going forward — the exclusion governs enforcement, not a one-time deliberate edit.

*Success:*
- The two duration tokens resolve as usable utilities; the DESIGN.md Motion section and the LEXICON "Motion tier" entry both exist and cross-reference each other.
- The ESLint rule reports on a `transition-*` utility without a tier utility, and does not report inside `src/components/ui/` — covered by a unit test following the pattern in `eslint.config.unit.test.ts`.
- `pnpm lint` passes repo-wide, which is itself the proof that every call site was migrated.
- `pnpm pre-push` is green.

### Epic 2: Table refetch dim feedback

- **2.1 The refetch dim always completes a full cycle.** The duplicated fetch-dim wrapper logic in the logs and users admin tables moves into one shared piece. Once a fetch triggers the dim, it stays dimmed for at least the transition's full duration before un-dimming, even when the fetch resolves sooner — so a fast response no longer reverses a fade mid-flight. Fetched rows render as soon as they arrive, dimmed, and fade up; nothing delays the data itself. `aria-busy` continues to reflect the actual fetch state rather than the visual hold, so assistive technology is never told content is pending after it is final.

*Success:*
- Both tables consume the shared piece; no duplicated dim logic remains in either.
- The shared logic is unit-tested with fake timers: a fetch resolving faster than the dim duration still reports the dimmed state for the full duration, then clears.
- `aria-busy` is true only while a fetch is actually in flight, assertable via role/aria queries rather than class assertions.
- `pnpm pre-push` is green.

---

## Notes

- **No dependency between the epics.** They can be built in either order.
- **Tests assert behavior, not classes.** `toHaveClass` is banned by lint, so the retrofit in Epic 1 is verified by `pnpm lint` passing rather than by per-component assertions. The testable artifacts are the ESLint rule itself and, in Epic 2, the shared dim logic under fake timers.
- **Token declaration form.** The existing color tokens indirect through `@theme inline` because they vary by light/dark — a `:root` value plus a differently-named bridge entry. Duration tokens have no such variance, so each is declared exactly once as a literal inside the `@theme inline` block: no `:root` entry, and no bridge line pointing a name at itself.
- **ADR candidates:** none — nothing in this phase clears the hard-to-reverse bar. Swapping the token layer for raw utilities later, or retuning either tier's value, is a cheap change.
