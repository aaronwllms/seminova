# ADR-0006: Settings reads cached under one coarse tag

**Status:** Accepted

App settings are read through Next.js's tagged server data cache under a
single `app-settings` tag covering the whole settings set; the settings-save
mutation calls `revalidateTag('app-settings')`. Tag-based invalidation is
used rather than a time-based `revalidate` TTL because the tag cache is
shared across serverless instances — an admin's save propagates everywhere
near-instantly, where a hand-rolled in-memory cache is per-instance and can't
be busted globally, and a TTL means every setting change has a staleness
window. One coarse tag rather than per-setting tags because the settings
table is small: re-reading the whole set on any single change costs
effectively nothing.

Trade-offs accepted: (1) every save invalidates every setting's cached read,
not just the one that changed — over-invalidation traded for zero
tag-management complexity; (2) reads depend on Next.js's data cache
semantics, so a spinoff deploying outside a platform with a shared cache
backend gets per-instance caching and loses the cross-instance propagation
guarantee. A future setting holding something large or expensive to compute
can be split onto its own finer tag without unwinding this.
