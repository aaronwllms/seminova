# ADR-0004: Profile settings is modal-only; APP_HOME diverges from the profile path

**Status:** Accepted

Profile settings moves from a dedicated page to a dialog opened from the app
shell, and the `/profile` route is removed — there is no deep link or
shareable URL to profile settings. This is only viable because `APP_HOME`
stops equaling the profile path: a new, separate placeholder surface becomes
the authenticated landing page, so removing `/profile` no longer breaks
post-auth routing. The trade-off accepted: a user (or a spinoff building
on top) cannot link directly to profile settings, cannot bookmark it, and
cannot land on it via browser back/forward — the surface is only reachable
through the app shell's UI. This was judged acceptable because the surface's
save models (blur-save, upload-on-complete) leave no unsaved state a deep
link would ever need to recover.
