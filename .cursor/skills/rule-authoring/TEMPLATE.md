# Rule Structure Template

Use this shape when creating a new `.cursor/rules/*.mdc` file.

```markdown
---
description: [One sentence - what guidance this provides]
globs:
  - '[Specific file patterns this applies to]'
alwaysApply: [true only if needed for ALL contexts]
---

# [Rule Title with Version if Applicable]

## Core Principles (2-5 bullets max)
- High-level project-specific guidance
- What makes this project unique

## When to Use/Apply
- Context when this rule matters
- Triggers for applying these patterns

## Key Patterns
- Principle 1 with brief explanation
- Principle 2 with brief explanation

## Anti-Patterns to Avoid
- What NOT to do (principles, minimal code)
- Why it's problematic in THIS project

## Cross-References
- See `[other-rule.mdc]` for [related topic]

## Reference Implementations
- `path/to/example.ts` - [What it demonstrates]

## Quick Reference / Checklist
- Actionable bullets for the agent
```
