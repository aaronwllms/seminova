# ADR-0001: Component sizing governed by module depth, not a line cap

**Status:** Accepted

We removed the hard 150-line component cap (from `LOCKED_RULES.md`) and now
size files by Ousterhout's module _depth_ — narrow interface over large hidden
implementation is fine; a wide interface from many responsibilities (god file)
is not — codified in `project-standards.mdc`, with `tech-debt-audit` realigned
to judge god-files on interface-width and responsibility count and to treat
500+ LOC as an inspect-trigger rather than a violation. The trade-off accepted:
we give up a single bright-line number that's trivial to check in favor of
principle-based judgment that requires reading the code to apply.
