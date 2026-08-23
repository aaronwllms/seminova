# PRD — Phase 19: Surface Coherence & Border Tokens

**Status:** `Active`
**Last updated:** 2026-08-23

---

## Problem

Border color is currently derived from a hardcoded reference surface rather than from the surface an element is actually painted on. The `surface-elevated` utility rebinds `--border`, `--input` and `--sidebar-border` to a `color-mix` against `--card`, so any surface that isn't `--card` wears a border derived from the wrong place.

The premise that made this safe is already false. The utility's own comment claims `--card`, `--popover` and `--sidebar` match — they match in dark only. In light mode `--sidebar` is `0.967` against `--card` at `1.0`, so the light sidebar already carries a border derived from a surface it isn't painted on.

The same defect exists in a second role nobody has named. `--input` is not only a border color: in dark mode it is also a fill, via `dark:bg-input/30` and `dark:hover:bg-input/50` across the field primitives and the outline button. That opaque fill lifts noticeably over `--background` and almost imperceptibly over `--card` — so the same field reads as filled on the page and effectively fill-less inside a dialog or the profile modal.

The failure surfaced through call sites, not through the rule. The profile modal carries hand-tuned opacity on two separators — a value reached for because the real rule wasn't discoverable. The sidebar shell correctly pairs its fill with `surface-elevated`; the dialog and profile modal don't. **Pairing-by-hand is the defect**, not any individual call site: the rule can only be satisfied by remembering it, and an ESLint rule that enforces the pairing enforces the symptom rather than removing the need.

There is also no existing invariant to formalize. Page-level border delta is ~0.064 in light and ~0.092 in dark; the `surface-elevated` card-level delta is ~0.087 light and ~0.078 dark. Four numbers, no constant. This phase *chooses* a delta rather than encoding one.

This PRD was fully grilled in a planning chat before decomposition into epics/stories.

## Goal

Make borders derive their contrast from the surface they are painted on by **alpha compositing**, not by per-surface derivation. `--border`, `--input` and `--sidebar-border` become a semi-transparent neutral — black-alpha in light, white-alpha in dark — so compositing *is* the derivation, and stays correct on surfaces that don't exist yet. That last property is what matters for a template: every spinoff re-skins, and a re-skin invents surfaces this repo has never rendered.

Token **names** are unchanged, so every vendored shadcn primitive keeps working untouched. With compositing in place, `surface-elevated` and its ESLint enforcement have nothing left to do and retire without a replacement utility.

Add `--border-muted` for dividers. The justification is perceptual, not historical: a border encloses, a divider separates *within* an enclosure, and a divider at the same weight as its container's border makes the boundary ambiguous. This is why systems that split, split — Material's `outline` vs `outline-variant`, Primer's `borderColor.default` vs `.muted`. The name is role-based rather than component-based so a table rule or an inset list can reach for the same weight without borrowing a token called "separator," and `border-muted` encodes the weight relationship, which is itself defence against the pairing-by-hand failure mode.

The alpha values themselves are set **by eye in both themes**, not derived. That pass is the phase's only verification and gets its own epic.

## Out of scope

- **Per-surface utility bundles** (`surface-card` / `surface-popover` / `surface-sidebar`, each deriving its own border via `color-mix` behind a named contrast-mix constant). Three problems: a fixed mix percentage produces different lightness deltas per theme, so the "constant" is a constant in the wrong unit; derivation removes the override point a designer wants; and it is still pairing-by-hand, just with fewer failure modes — one utility name has to be remembered exactly as `surface-elevated` did.
- **A lint rule banning opacity modifiers on border utilities.** Proposed in the shape of `local/motion-tier`. It enforced against a symptom of an undiscoverable rule; with compositing plus `--border-muted` there is nothing left to ban. The earlier rejection of a semantic `<SectionDivider>` wrapper also still stands — a className passes straight through it.
- **A `surface-background` utility.** Base tokens are already calibrated for the page surface, so it would change nothing. No-op rules don't get added.
- **Moving dialogs to `--popover`.** shadcn assigns `--popover` to floating menu layers and `--background` to dialog / alert-dialog / sheet. Under compositing both are correct, so this is taste — and it would restyle every modal for no systems gain.
- **Border coverage in the contrast check.** See Notes; the parked debt marker has a stated trigger and this phase does not meet it, and building a compositing resolver is larger than the phase itself.
- **The two loose findings from the same sweep** — the accordion trigger's horizontal padding breaking the profile modal's content column, and the bio textarea's resize grabber. Both are known fix, known site, no product decision, so they route to `// debt:` markers per DOC_RULES rule 7 rather than into this phase. Neither passes the inclusion test the separator inset passes (see Notes).
- **A design-system coherence audit.** Everything here was found by walking past it. A real audit is separate and unbounded.

---

## Epics & stories

### Epic 1: Composited border tokens and `surface-elevated` retirement `Complete`

- **1.1 Border tokens composite against whatever surface they are painted on.** `--border`, `--input` and `--sidebar-border` become semi-transparent neutrals in both themes — black-alpha in light, white-alpha in dark — at starting values of roughly 0.09 and 0.10 respectively. All three take the **same value per theme**; they are not independently tuned, which keeps the tuning space to one number per theme and preserves the fill-role analysis in Notes. `--border-muted` is added alongside as the one separately-tuned value, deliberately lighter, with a matching bridge entry in the `@theme inline` block — without it there is no utility to consume the token.

- **1.2 Dividers read as dividers rather than as borders.** All three separator components — the `Separator` primitive, the dropdown-menu separator and the select separator — default to the muted border token, so no call site ever chooses between the two weights. The two hand-tuned opacity overrides in the profile modal are **deleted** rather than re-pointed; those elements become bare separators. The menu separators' negative horizontal margin, which currently goes full-bleed against the popover's padding, is corrected so they align to the 12px content column that every item variant already respects. These are the outliers, and only because shadcn shipped them that way.

- **1.3 The pairing-by-hand rule is gone, not merely unused.** `surface-elevated` retires completely and atomically: the utility and its explanatory comment, the custom ESLint rule file, both of its registrations in the ESLint config, its coverage in `eslint.config.unit.test.ts`, every call site, and the `.cursor/rules/ui-styling.mdc` bullet that documents it. Call sites are found by **string grep, not by running the rule** — the rule ignores `src/components/ui/`, and several sites live there and carry the utility voluntarily, so a lint-driven enumeration undercounts. One of them also sets a toast border through a CSS custom property into a third-party component: **that line is retained** and is precisely what carries the composited value into the toast; only the utility className is removed from it.

- **1.4 Re-skinning a spinoff cannot silently revert the decision.** DESIGN.md's structure-vs-theme split names the alpha channel as inherited structure — after this phase, hue and lightness on border tokens are re-skinnable theme while the alpha channel is not. The re-skin workflow's diff-apply step carves out border alpha, because a generated palette export ships opaque borders and following the documented workflow correctly would otherwise revert this phase. The smoke-test step covers both themes rather than dark only, and gains the dark field-fill composites. The semantic colors table loses its `surface-elevated` row and gains a `border-muted` row.

*Riders (not stories):* `// debt:` markers at the two loose-finding sites, both in files already open for this epic. Attempt a re-skin audit grep for an opaque border token — it would be the only mechanical backstop this decision gets anywhere — but ship it only if it can be written cleanly, and do not treat it as a success criterion.

*Success:* — mechanical only; this epic carries **no** visual judgment, so that the human gate cannot drift into it
- `pnpm pre-push` is green.
- A repo-wide grep for `surface-elevated` returns nothing.
- A grep for opacity modifiers on any border token — in both the background and border utility shapes, including the sidebar variant — returns nothing.
- The custom rule appears nowhere in the ESLint config, and neither shared union type in `eslint.config.unit.test.ts` retains a member naming it.
- All four border tokens carry an alpha channel in both `:root` and `.dark`, and the muted token has a bridge entry in `@theme inline`.

### Epic 2: Calibration surface and the by-eye pass

- **2.1 Anyone re-skinning the template can see every border composite on one screen.** An authenticated route under the app route group renders each cell of the verification matrix in the current theme. This exists because the pass is not otherwise performable: menus and dialogs are both transient overlays and cannot be open simultaneously, and the sidebar and cards do not co-occur on any real screen — so several of the criteria below have no surface to be judged on without it. The route uses live semantic utilities only; it is a **verification** surface, not a comparison grid.

- **2.2 Border and divider weights are set by eye rather than by arithmetic.** Final alpha values are returned from the pass and applied. Every number traded during planning is an approximation (see Notes) — the pass is the actual measurement.

- **2.3 A spinoff's kickoff knows to delete this surface.** The `initialize-project` skill's workshop-surface list names this route explicitly. That list is currently a parenthetical example, and naming the route is the difference between the removal path covering it by convention and covering it by name.

- **2.4 The decision survives as a record.** An ADR scoped narrowly to *borders derive from their surface by compositing, not by per-surface derivation — one value, no surface-token proliferation*, with one sentence on why not derivation, since that is the intuitive approach and someone will re-propose it. Not a rejected-alternatives section: the alternatives are preserved in this PRD. A short LEXICON entry for **composited border** points at it, so "why is there no `surface-card`?" is answerable in one lookup. **Depends on 2.2** — the divider verdict is a live structural outcome of the pass, and an ADR is immutable once accepted.

*Constraints this epic cannot infer:*
- **No arbitrary or raw values on the route.** Sequential A/B is done by editing the border token on `:root` in DevTools, which repaints every cell live — close enough to simultaneous that a comparison grid should not be reached for.
- **Inline `style` to evade the semantic-token rule is prohibited outright.** Evading a lint rule's implementation while violating its intent is worse than taking an exemption, precisely because it leaves no trace — a sanctioned exemption is visible in review, an inline style isn't. If simultaneous comparison proves genuinely necessary, it is an exemption in `ui-styling.mdc`, in the open.
- **The epic halts after 2.1 for a human pass and does not self-certify.** The gate may cross a session boundary. "Verified in both themes" is not a thing this epic may assert on its own.
- **If a single muted-border value fails in either the dense-menu or the content-divider context, halt and report. Do not introduce a second token.** That would reverse a settled decision, which is a PM call, not something discovered and implemented mid-epic. Same shape as the never-promote rule on `mark-epic-complete`.

*Success:*
- `pnpm pre-push` is green.
- The semantic-token check is clean on the new route, and the route's rendered classNames contain no arbitrary values and no inline style colors.
- The ADR exists in `docs/adr/` and LEXICON.md carries a **composited border** entry pointing at it.
- In both themes, a border is visible against page, card, popover and sidebar surfaces without any one of them reading heavier than the others on the same screen.
- In light mode, the sidebar border is visible against the sidebar surface without reading heavier than the card border beside it.
- In dark mode, field fill is present and equivalent whether a field sits on the page or inside the profile modal, at both the resting and hover opacities — the hover cell is judged by hovering the avatar "Change" button, which is an outline button and always rendered, against an outline button on the calibration route.
- A divider inside a dropdown reads lighter than that menu's own border, and a divider in the profile modal reads lighter than the modal's border, at the same muted-border value.
- The toast border is visible against the toast's own fill in both themes.
- Any delta small enough that it could be an artifact of the approximation described in Notes is left alone rather than tuned.

---

## Notes

- **Epic order is fixed.** Epic 2 depends on Epic 1. They belong on the same phase branch — Epic 1 ships provisional values, so there is a window in which the borders have not been looked at by anyone.

- **The retirement must be one atomic commit, in order.** Removing the utility first turns every elevated fill outside the vendored primitives into a lint error; removing the rule first leaves the sites carrying a meaningless utility but green. Rule, both config registrations, test surgery, utility, and all call sites land together. The natural instinct is to do the "safe" half first; don't.

- **Deleting the lint rule is authorized and is the deliverable.** Removing an `error`-level rule is a Blocking finding shape on the Standards axis by default. It is correct here because compositing removes the need for the pairing the rule enforced. There is no dedicated check script to delete — the rule surfaces through the semantic-token check, which simply runs the whole ESLint config.

- **Test surgery is entangled, not a block delete.** The rule's coverage shares a helper with the motion-tier tests, parameterized by two union types. Deleting the describe block and the helper leaves dead members in those unions, and type-check still passes with them present — exactly the kind of residue that survives review. Narrow both unions to single members.

- **Deleting the rule closes a debt marker.** The rule's own header records that it reads class strings only and therefore misses two sites — a toast border set via a style object, and an SVG diagram's fill attributes. Both cases evaporate with the rule.

- **The fill role is fixed by this change, not merely tolerated by it.** Under the current opaque token, the dark field fill lifts about 0.028 over the page surface but only about 0.006 over the card surface — the identical defect this phase exists to kill, in a second role. Under compositing the two converge to roughly 0.024 and 0.022. Accepting that border weight and dark field fill are now one number is not a side effect being tolerated; it is the same fix reaching a second role for free. It is also why keeping the shadcn convention matters: every primitive vendored in later arrives carrying it.

- **Every delta quoted in this document is an approximation.** Browsers composite alpha in sRGB rather than by interpolating perceptual lightness, so these numbers are directionally reliable and not precise. That reinforces the plan rather than undermining it — the by-eye pass is the measurement, and any delta small enough that the approximation could flip it is not worth acting on.

- **Two known consequences to verify rather than be surprised by.** The light-mode sidebar border currently sits only ~0.05 from its surface and will land at the chosen delta, becoming slightly more visible. And dark fields inside cards and dialogs gain a visible fill they effectively do not have today — roughly fourfold — which is a real change to every modal form.

- **There is no automated contrast coverage for borders, before or after.** The contrast check tests explicit base/foreground pairs and no border token appears among them, so alpha in borders cannot break it and CI is clear. But WCAG 1.4.11 wants 3:1 for UI component boundaries and nothing verifies that here. The by-eye pass is therefore not a nice-to-have; it is the only verification this decision will ever get, and the muted border — deliberately the lightest value — is the most likely to sit under 3:1 with no backstop.

- **A parked debt marker sits adjacent and is not tripped by this phase.** The contrast check parses an alpha channel but never composites it against the base before computing the ratio, with the stated trigger being a semantic pair actually using alpha. Border tokens are not among the checked pairs, so this phase does not meet that trigger — but it will the moment anyone adds an alpha pair that is checked. Recorded here so a later phase does not rediscover it.

- **The separator inset rides along; the other sweep findings don't.** The inclusion test is that the work is the *same keystroke* — the menu separators' weight and their inset are the same edit to the same attribute in the same className string, which is being rewritten regardless. Same-file proximity is explicitly not the test: the accordion finding is in a file this phase already touches and still does not qualify, because it is a different element and a different attribute, and "the trigger's text aligns to the modal's content column" is not gradeable against surface coherence. It would land as an orphan criterion, which is the same failure the phase avoided by not folding itself into an unrelated phase.

- **The calibration route is template-scoped, not temporary.** It persists, under the app route group rather than the public one — a public route would need an auth-boundary allowlist edit plus its enforcement, then a revert, which is a hard-constraint round trip for a workshop surface. The template already has a category for surfaces that live here and get deleted by a phase in the spinoff's own roadmap; this is a fourth member of that set, not a new problem. Whether it should eventually graduate to the public reference page as a demo is genuinely open and unjudgeable until the pass has been run once — that goes to BACKLOG.md afterward, not into this phase.

- **`check:a11y-structure` applies to the new route** — one `<h1>`, no skipped heading levels. Cheap to satisfy, easy to forget on a bare token grid.
