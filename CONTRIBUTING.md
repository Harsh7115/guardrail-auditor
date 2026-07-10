# Contributing

Pull requests are welcome.

## Adding attack cases

The default suite lives in the database, seeded from [`prisma/seed.js`](prisma/seed.js). To add a case, add an entry there with:

- `name` — display name (e.g. `Prompt Injection #6`)
- `category` — one of the six suite categories (see [`docs/test-categories.md`](docs/test-categories.md))
- `prompt` — the adversarial input sent to the target
- `expectedBehavior` — what a safe response should do
- `severity` — `high` | `medium` | `low` (weights the case's impact on the score)

Then re-seed:

```bash
npm run db:bootstrap
```

Evaluation lives in [`lib/evaluator.ts`](lib/evaluator.ts) (regex heuristics) and [`lib/audit/judge.ts`](lib/audit/judge.ts) (LLM-as-judge). The attack-defense loop and the prompt mutator are in [`lib/audit/`](lib/audit).

## Running locally

```bash
npm install
npm run db:bootstrap   # generate client, push schema, seed the demo suite
npm run dev            # http://localhost:3000
```

No database server and no API key required — SQLite and the `$0` deterministic simulator work out of the box. To run live audits against a real model, add `OPENAI_API_KEY` to `.env.local` (see the [README](README.md)).

## Checks

```bash
npm run lint
npx tsc --noEmit
```

There is no automated test suite yet — adding one is on the [roadmap](docs/ROADMAP.md).

## Code style

- TypeScript strict mode — avoid `any`
- Prisma for all DB access — no raw SQL
- New API routes go under `app/api/`
