# GitHub Docs Authoring — reference

Seminova-specific markdown conventions for files rendered on GitHub.

## External authority

- [About writing and formatting on GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/about-writing-and-formatting-on-github)
- [Basic writing and formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
- [Working with advanced formatting](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting)
- [Quickstart for writing on GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github)
- [GitHub Flavored Markdown Spec](https://github.github.io/gfm/)

## Renderer matrix

| Feature | GitHub | Cursor markdown preview | Claude chat paste |
| ------- | ------ | ------------------------- | ----------------- |
| GFM alerts (`> [!NOTE]`, etc.) | Yes | Usually yes | Renders as text/blockquote — readable |
| Tables | Yes | Yes | Readable |
| Task lists `- [ ]` | Yes | Often yes | Readable |
| `<picture>` theme-aware SVG | Yes | **Often broken / icon only** | N/A |
| `<details>` collapsed sections | Yes | Varies | May not collapse |
| Mermaid diagrams | Yes | Varies | Not rendered |
| HTML comments `<!-- -->` | Hidden | Hidden | Visible in source paste |
| Relative links between repo files | Yes — branch-aware | Yes locally | Paths are plain text |

**Template pattern:** theme-aware workflow diagrams use `<picture>` with
`images/workflow-light.svg` / `workflow-dark.svg` — document the Cursor preview
gap where the diagram matters (see WORKFLOW_GUIDE Visual overview).

**Deferred:** Mermaid swimlane workflow diagram — tracked in
[docs/WORKFLOW_BACKLOG.md](../../../docs/WORKFLOW_BACKLOG.md); do not recommend
Mermaid replacement until that item resolves.

## Seminova defaults

### Alerts

Use GFM alerts for skimmable callouts — not bold paragraphs or raw blockquotes.

| Type | Use for |
| ---- | ------- |
| `NOTE` | Helpful context, renderer caveats, non-blocking tips |
| `TIP` | Optional efficiency advice |
| `IMPORTANT` | Must-not-miss workflow gates |
| `WARNING` | Security, data loss, or deploy blockers |
| `CAUTION` | Risky actions with negative outcomes |

**Density:** GitHub recommends sparing use (~1–2 per article). Onboarding docs
(README Quick start) may legitimately carry more WARNING/IMPORTANT blocks —
weigh context before flagging overload.

**Placement:** Avoid consecutive alerts; separate with prose.

### Links

- **In-repo files:** relative paths (`docs/WORKFLOW_GUIDE.md`, `../AGENTS.md`) —
  not `https://github.com/.../blob/main/...` for same-repo navigation
- **Section links:** GitHub auto-anchors headings (lowercase, spaces → hyphens).
  Flag links that will break if the heading text changes
- **External:** full URLs; descriptive link text, not "click here"

### Images

- Meaningful `alt` on every `![]()` and `<img alt="...">`
- Repo assets: relative paths under `images/` or `.github/`
- Theme-aware branding/diagrams: `<picture>` + `prefers-color-scheme` sources
  (see README / WORKFLOW_GUIDE workflow diagrams)

### Tables

Use for reference data — scripts, env vars, doc roles, model tiers. Avoid tables
for prose paragraphs.

### Task lists

Use **only for checklists** (merge gates, manual test steps, skill step lists) —
not as bullet replacements in narrative prose.

Escape leading parentheses in task text when needed: `\- [ ] \(Optional) …`

### Code fences

- Shell commands: ` ```bash ` or ` ```sh `
- Markdown examples in skills/docs: ` ```markdown `
- JSON/env: language tag matching content
- Never commit secrets in example blocks

### Structure

- One `#` title per file; logical `##` / `###` hierarchy (GitHub builds an
  outline from h2+)
- Optional depth (FAQ, long appendix): consider `<details><summary>…</summary>`
  — especially in WORKFLOW_GUIDE-style optional sections
- Deferred work: HTML comments `<!-- TODO: … -->` (hidden on GitHub render)

### Features to use sparingly or skip

| Feature | Guidance |
| ------- | -------- |
| Footnotes `[^1]` | Avoid — alerts + links cover our needs |
| Raw HTML beyond picture/details/comments | Avoid unless required for rendering |
| Mermaid | Defer per WORKFLOW_BACKLOG |
| `@mentions` / `#issue` in static docs | PR/issue comments only |
| Color swatches in backticks | Issues/PRs only — not needed in repo docs |

## Review checklist

Apply to each file under review:

- [ ] **Links:** in-repo targets use relative paths and resolve from the file's directory
- [ ] **Anchors:** internal `#section` links match current heading text
- [ ] **Headings:** single h1; no skipped levels; outline-friendly h2/h3
- [ ] **Alerts:** GFM alert syntax; not excessive or back-to-back without prose
- [ ] **Images:** alt text present; relative paths for repo assets
- [ ] **Picture elements:** fallback `img` + light/dark sources where used; Cursor preview caveat noted if user-facing
- [ ] **Tables:** reference data only; columns align readable in source
- [ ] **Task lists:** checklist contexts only
- [ ] **Code fences:** language tags on non-trivial blocks
- [ ] **Comments:** TODOs use `<!-- -->`, not visible prose
- [ ] **Voice:** matches sibling docs (tone, table vs list habits)
- [ ] **Scope:** formatting only — doc ownership questions deferred to DOC_RULES

## Accepted patterns (do not flag)

- README / WORKFLOW_GUIDE `<picture>` workflow diagrams with documented Cursor preview limitation
- Multiple WARNING/IMPORTANT blocks in README Quick start (env/auth setup)
- Manual "Contents" TOC in long docs (WORKFLOW_GUIDE) — complements GitHub outline
- Agent-authored docs listed in `.prettierignore` — formatting may differ; do not demand Prettier conformance via this skill

## Common must-fix findings

- Broken links (target file or anchor does not exist)
- Missing `alt` text on meaningful images
- Leading-slash root-relative links (`/docs/FOO.md`) — resolve on GitHub but break local markdown preview, which reads them against the filesystem root; use a relative path instead
- Heading hierarchy that breaks GitHub's outline (skipped levels, multiple h1)

## Common should-consider findings

- Long FAQ or appendix sections without `<details>` collapse
- Fenced blocks missing language tags (`bash`, `markdown`)
- Absolute GitHub blob URLs pointing at files in the same repo
- Plan handoff markdown (Cursor → Claude) using features that paste fine but won't preview in all tools — note in renderer section, not must-fix
