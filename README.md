# Guardrail Auditor

An end-to-end Next.js 14 + Prisma + Tailwind SaaS-style MVP for auditing LLM applications. It simulates prompt-injection, data leakage, role bypass, out-of-scope, grounding, and instruction hierarchy tests, then produces a risk dashboard with exports.

## Stack
- Next.js 14 App Router (TypeScript)
- Tailwind CSS + shadcn-inspired primitives
- Prisma + SQLite
- Recharts for charts
- zod for validation
- CSV / JSON exports (papaparse-style)

## Getting Started
1) Install deps  
`npm install`

2) Configure env  
`cp .env.example .env`

3) Prisma setup & seed  
`npx prisma generate`  
`npx prisma db push`  
`npx prisma db seed`

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
- Deterministic evaluator in `lib/evaluator.ts` (regex heuristics for refusal/leak/compliance/grounding).
- Charts rendered client-side (`components/charts.tsx`).
- Prisma schema in `prisma/schema.prisma`; seed cases in `prisma/seed.ts`.

## Adding real model calls
Replace `simulateResponse` in `lib/actions.ts` with provider calls; keep evaluator to score outputs.

## PDF export (optional)
Hook into `pdf-lib` in an API route and render a summary; CSV/JSON already implemented.

## Scripts
- `npm run dev` – start app
- `npm run build` – production build
- `npm run prisma:push` – sync schema
- `npm run prisma:seed` – seed demo data

## License
Internal demo use. Adjust as needed.
