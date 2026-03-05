# Repository Guidelines

## Project Structure & Ownership
- `app/`: Next.js App Router routes, API handlers, server actions, and UI components.
- `app/components/models/books/`: React Three Fiber 3D book models and scene parts.
- `app/store/`: Valtio stores for app, auth, cart, and UI state.
- `lib/`: server-side integrations (Contentful, Shopify, auth/session, utilities).
- `types/`: domain types and generated Contentful types (`types/generated/`).
- `scripts/`: operational scripts (for example, Contentful book creation).
- `docs/`: architecture and implementation notes.
- `public/`: fonts, models, textures, and static assets.

## Build, Lint, and Dev Commands
- `npm run dev`: run local dev server with Turbopack.
- `npm run build`: production build.
- `npm run start`: serve production build.
- `npm run lint` / `npm run lint:fix`: Next.js ESLint checks.
- `npm run typecheck`: strict TypeScript validation.
- `npm run format` / `npm run format:check`: Prettier formatting.
- `npm run generate-types`: regenerate Contentful TS types.
- `npm run create-book`: interactive Contentful book creation script.

## Coding Conventions
- TypeScript strict mode is required; avoid `any` unless explicitly justified.
- Use path aliases (`@/*`) for internal imports when appropriate.
- Formatting: Prettier defaults (double quotes, semicolons, 80-column wrap).
- Keep 3D/R3F components client-only (`"use client"`) and isolate rendering logic from API/data code.
- Follow existing naming patterns: components in `PascalCase`, stores/hooks in `camelCase` file names.

## Validation Before PR
- Minimum local checks for code changes:
  1. `npm run typecheck`
  2. `npm run lint`
  3. `npm run build` (for routing, server action, or config changes)
- If you modify Contentful schemas or related transforms, also run `npm run generate-types`.

## Environment & Security
- Keep secrets in `.env.local`; never commit credentials.
- Required integrations include Contentful, Shopify, JWT, Resend, and reCAPTCHA keys.
- Prefer server-only access patterns for tokens and external API clients (`lib/` + API routes/server actions).

## Change Discipline
- Make focused changes; avoid broad refactors without a clear need.
- Preserve existing architecture decisions documented in `/docs` and `CLAUDE.md`.
- For UI/3D performance-sensitive paths, prioritize incremental, measurable improvements.
