# Cursor Rules — Localfront

This directory contains modular Cursor AI rules using the `.mdc` format, consolidated from battle-tested patterns on [cursorrules.org](https://cursorrules.org) and optimized for this stack.

See [`.cursor/README.md`](../README.md) for skills, agents, and planning doc layout.

## Sources

These rules are derived from:

- [TypeScript (Next.js, Supabase)](https://cursorrules.org/article/typescript-nextjs-supabase-cursorrules-prompt-file)
- [Next.js, Supabase, Shadcn PWA](https://cursorrules.org/article/nextjs-supabase-shadcn-pwa-cursorrules-prompt-file) (PWA parts excluded)
- [Next.js (React, Tailwind)](https://cursorrules.org/article/nextjs-react-tailwind-cursorrules-prompt-file)
- [Git Conventional Commits](https://cursorrules.org/article/git-conventional-commit-messages)
- [DRY & SOLID Principles](https://cursorrules.org/article/optimize-dry-solid-principles-cursorrules-prompt-f)
- Project-specific patterns from this codebase

## What We Adopted

✅ **From Community Rules:**

- DRY and SOLID principles
- 150-line file size limit
- RORO pattern (Receive Object, Return Object)
- Arrow functions for components
- Named exports preference
- Conventional commits specification (complete spec)
- Specific Web Vitals optimization guidance
- Mobile-first responsive design patterns
- Minimize 'use client' usage patterns

✅ **Project-Specific Additions:**

- Supabase @supabase/ssr integration patterns
- TanStack Query v5 specific guidance
- Jest + React Testing Library + MSW v2 patterns
- Existing file structure and import conventions
- pnpm package manager usage

## What We Excluded

❌ **Not Relevant to This Project:**

- PWA functionality (Progressive Web App features)
- Vercel AI SDK integration
- Build Notes system (project management approach)
- Monorepo structure and conventions
- Zustand state management (using TanStack Query instead)
- Taskfile.yml commands (using pnpm scripts)
- nuqs for URL state (not currently in use)

This directory contains modular Cursor AI rules using the new `.mdc` format. Each file targets specific aspects of the codebase with file pattern matching.

## Rule Files

**Note:** As of the latest optimization, UI rules have been split into three focused files for better maintainability and clearer separation of concerns.

### 📘 `typescript.mdc`

**Applies to:** All TypeScript files (`**/*.ts`, `**/*.tsx`)

- TypeScript strict mode conventions
- Interface vs type preferences
- Type safety best practices
- Component prop typing patterns

### ⚡ `nextjs.mdc`

**Applies to:** Next.js App Router files (`src/app/**/*`, `src/components/**/*`)

- Server vs Client Component patterns
- Next.js 14 conventions (error.tsx, loading.tsx, route.ts)
- Data fetching strategies
- Performance optimization
- API route patterns

### 🔐 `supabase.mdc`

**Applies to:** All source files, utils, middleware

- Context-specific Supabase client usage
- Migration safety protocols and database operations
- Client creation patterns for different Next.js contexts
- Integration with @supabase/ssr

### 🔒 `security.mdc`

**Applies to:** All source files, API routes, middleware, migrations

- Authentication and authorization patterns
- Input validation with Zod (required for all API inputs)
- Supabase Row Level Security (RLS) policies and testing
- Data protection and DTO patterns
- Common vulnerabilities (OWASP Top 10) with examples
- Next.js-specific security (CSRF, open redirects, CORS)
- Security testing patterns and checklists

### 🔄 `react-tanstack-query.mdc`

**Applies to:** Hooks and components (`src/hooks/**/*`, `src/components/**/*`)

- TanStack Query v5 patterns
- Custom hook creation
- Query key conventions
- Mutation patterns with optimistic updates

### 🎨 `ui-shadcn.mdc`

**Applies to:** Component files, especially `src/components/ui/`

- **Comprehensive shadcn/ui guidance**: CLI usage, adding components
- shadcn/ui philosophy and Radix UI relationship
- Customization patterns and variant management with cva
- Component composition patterns using asChild
- Creating composite components from shadcn primitives
- Common shadcn patterns (forms, dialogs, button groups)
- Best practices for shadcn/ui development

### 🎨 `ui-styling.mdc`

**Applies to:** All component files

- Tailwind CSS utility-first styling
- cn() utility for conditional classes
- Dark mode with next-themes and CSS variables
- Responsive design patterns (mobile-first approach)
- Breakpoint usage and common responsive patterns
- Image optimization with Next.js Image component
- Component organization standards

### ♿ `ui-accessibility.mdc`

**Applies to:** All component files

- Accessibility best practices (WCAG 2.1 AA compliance)
- Semantic HTML and heading hierarchy
- ARIA labels and descriptions
- Keyboard navigation patterns
- Color contrast requirements
- Screen reader support
- Form accessibility
- Testing tools and manual testing checklist

### 🧪 `testing.mdc`

**Applies to:** Test files (`**/*.test.ts`, `**/*.test.tsx`, `src/mocks/**/*`)

- Jest + React Testing Library patterns
- MSW v2 API mocking
- Arrange-Act-Assert pattern
- User behavior testing focus

### 🔀 `git-workflow.mdc`

**Applies to:** All files

- Conventional commit message format
- Commit types (feat, fix, test, docs, etc.)
- Pre-commit hooks and quality checks
- Branch naming conventions

### 📝 `pm-collaboration.mdc`

**Applies to:** Always active

- PM + AI Developer partnership mode
- Communication style preferences
- Technical decision-making process
- Testing and validation approach
- Collaboration principles

### 📐 `general-conventions.mdc`

**Applies to:** Always active

- Date & time handling conventions
- ISO 8601 format standards
- Environment awareness
- Migration file timestamp formats

### 🌐 `api-development.mdc`

**Applies to:** API routes and contracts (`src/app/api/**/*`, `src/lib/api-contracts/**/*`)

- RESTful API path naming standards
- Input validation with Zod schemas
- Error handling and response envelopes
- Data Transfer Objects (DTOs)
- Type safety patterns
- API route checklist

### 📋 `project-standards.mdc`

**Applies to:** All TypeScript files

- General coding standards
- File naming and organization
- Component structure patterns
- Import conventions with @/ alias
- Performance guidelines
- Basic security reminders (see security.mdc for comprehensive guidance)

## How It Works

Cursor AI automatically reads these rules and applies them based on:

1. **File patterns** defined in the `globs` frontmatter
2. **Context** of what you're working on
3. **Consolidation** from multiple matching rules

## Updating Rules

To modify a rule:

1. Edit the relevant `.mdc` file
2. Changes take effect immediately in Cursor
3. Commit changes so your team stays in sync

## Benefits of This Structure

✅ **Modular** - Easy to update individual concerns  
✅ **Context-aware** - Rules apply to relevant files only  
✅ **Focused** - UI rules split into 3 files (shadcn, styling, accessibility) for clarity  
✅ **Optimized size** - All files under 200 lines (recommended < 500 lines)  
✅ **Version controlled** - Rules live with your code  
✅ **Team consistency** - Everyone gets the same AI assistance  
✅ **Maintainable** - Clear separation of concerns

## File Size Optimization

- **Previous**: 1 large ui-styling.mdc file (344 lines)
- **Now**: 3 focused files (~150, ~150, ~200 lines respectively)
- **Benefit**: Easier to scan, update, and maintain specific concerns

## Reference

For more information, see:

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [`.cursor/README.md`](../README.md) — portable layout, skills-first policy
- [Project AGENTS.md](../../AGENTS.md) — repo truth and locked rules
- [CONTEXT.md](../../CONTEXT.md) — roadmap and ACTIVE build scope
