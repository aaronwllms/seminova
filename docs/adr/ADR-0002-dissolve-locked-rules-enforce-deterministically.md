# ADR-0002: Dissolve locked rules; enforce the hard constraints deterministically

**Status:** Accepted

We retired `LOCKED_RULES.md` and the locked-rule concept entirely, rather than
relocating its text. The pattern was inherited from a Claude-Code-centric
template with no conditional rule loading, where a flat always-visible file
is the only enforcement mechanism available — but prompt-level rules are
suggestions an agent can silently ignore, not guarantees, so the file was
never actually enforcing anything. Of the twelve original locked rules, five
are genuine invariants where an agent's local "improvement" would be
dangerous (pnpm-only, primitive-first UI, semantic tokens, the auth boundary,
the admin gate); these move to deterministic checks — lint rules, tests, and
CI/pre-push gates — with a short mirror list in `AGENTS.md § Hard constraints`
for plan-time reference. The remaining rules were never invariant, only good
convention, and are demoted to ordinary guidance inline in their owning
`.cursor/rules/*.mdc` files. The trade-off accepted: `plan-review` and
`phase-planning` lose a single-file input and a blocking check that covered
twelve rules; going forward they check plans only against the five-item hard
constraint list, and defer to CI to catch anything that isn't yet mechanically
enforced.
