# Guardrail Auditor

An end-to-end Next.js 14 + Prisma + Tailwind MVP for auditing LLM applications. It now uses a modular audit pipeline that separates target execution, evaluation, and run aggregation while persisting structured evidence and version metadata for each run.

## Stack
- Next.js 14 App Router (TypeScript)
- Tailwind CSS + shadcn-inspired primitives
- Prisma + SQLite for local demo data
- Recharts for charts
- zod for validation
- CSV / JSON exports (papaparse-style)

## Getting Started
1) Install deps  
`npm install`

2) Configure env  
`cp .env.example .env`

The default setup uses a local SQLite file at `prisma/dev.db`, so no database service is required for the demo.

3) Prisma setup & seed  
`npm run db:bootstrap`

4) Run dev server  
`npm run dev`  
Open http://localhost:3000

### Demo data
Seed creates a demo project (`demo-project`) and a completed audit run (`demo-run`). Nav link “Demo Run” opens the dashboard instantly.

## Key Flows
- Landing page → “Create Audit Project”
- Configure target per mode (Prompt-only, Endpoint, RAG)
- Select audit categories → Run audit
- View dashboard (overall score, category bars, verdict donut, table)
- Drill into test details
- Export JSON/CSV from dashboard

## Architecture Notes
- Server actions in `lib/actions.ts` handle create/update/run/export.
- Audit execution, scoring, and aggregation are separated under `lib/audit/*`.
- `lib/evaluator.ts` still provides the heuristic scorer, but it now sits behind a pipeline seam instead of being embedded inside the run loop.
- Charts rendered client-side (`components/charts.tsx`).
- Prisma schema in `prisma/schema.prisma`; seed cases in `prisma/seed.js`.

## Database strategy
The repository defaults to SQLite for deterministic local setup and zero-cost demos. If you later move the app to a hosted database, update `prisma/schema.prisma`, set a matching `DATABASE_URL`, then run `npm run prisma:push` and `npm run prisma:seed` against that target.

## Adding real model calls
Add provider-specific executors in `lib/audit/executor.ts` for OpenAI, Anthropic, and production endpoint adapters. The current implementation keeps a simulated fallback plus a generic HTTP executor seam.

## PDF export (optional)
Hook into `pdf-lib` in an API route and render a summary; CSV/JSON already implemented.

## Scripts
- `npm run dev` – start app
- `npm run build` – production build
- `npm run prisma:push` – sync schema
- `npm run prisma:seed` – seed demo data
- `npm run db:bootstrap` – generate client, push schema, and seed demo data

## License
Internal demo use. Adjust as needed.
