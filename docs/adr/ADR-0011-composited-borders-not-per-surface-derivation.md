# ADR-0011: Composited borders, not per-surface derivation

**Status:** Accepted

`--border`, `--input`, and `--sidebar-border` share one compositing alpha per theme; `--border-muted` is the only separately-tuned lighter value. There are no `surface-*` utilities that rebind border tokens per surface.

Derivation against a named surface — for example, mixing against `--card` — is still pairing-by-hand: a re-skin that invents a surface has no correct pairing until someone remembers to add it. Compositing stays correct on surfaces that do not exist yet.

shadcn's default dark `--border` is already this shape (white-alpha), so this is alignment with the ecosystem, not a local invention.

The trade-off is giving up independently tuned border vs input vs sidebar-border, and accepting that dark field fill now derives from the same token as the border — `bg-input/30` composites that alpha rather than carrying a value of its own. Both are the point.
