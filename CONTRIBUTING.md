# Contributing

Pull requests are welcome.

## Adding Attack Vectors

Attack probes live in `app/lib/probes/`. Each probe is a module that exports:

```ts
export interface Probe {
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  prompts: string[]
  evaluate: (response: string) => boolean  // true = attack succeeded
}
```

Add your probe file, then register it in `app/lib/probes/index.ts`.

## Running Locally

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and OPENAI_API_KEY
npx prisma migrate dev
npm run dev
```

## Running Tests

```bash
npm test
npm run lint
```

## Code Style

- TypeScript strict mode — no `any`
- Prisma for all DB access — no raw SQL
- New API routes go under `app/api/`
