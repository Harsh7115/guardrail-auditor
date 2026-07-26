# Architecture

How Guardrail Auditor is put together: the request lifecycle, the audit pipeline,
the data model, and where each concern lives in the tree. For scoring math see
[`scoring.md`](scoring.md); for the attack taxonomy see
[`test-categories.md`](test-categories.md); for the security posture see
[`threat-model.md`](threat-model.md).

## System overview

```
Browser ── Next.js 14 App Router (RSC + Server Actions)
              │
              ├─ Marketing landing (app/page.tsx)
              ├─ Dashboard shell (app/(app)/*)  → projects, runs, findings
              └─ Export API (app/api/audit-runs/[id]/export)
              │
           Server Actions (lib/actions.ts)
              │
           Audit pipeline (lib/audit/*)
              │
           Prisma ORM ── SQLite (default)  |  Postgres (managed)
              │
           OpenAI SDK (optional — off = $0 deterministic simulator)
```

Everything runs inside one Next.js app. There is no separate backend service:
data mutations are **Server Actions**, reads are **React Server Components**, and
the only REST surface is the export route.

## Request lifecycle

A full audit is one server action, `runAudit(projectId, categories?)` in
[`lib/actions.ts`](../lib/actions.ts):

1. Load the project + its `TargetConfig`, snapshot the target, and pin the
   suite / evaluator / execution versions (so runs stay comparable over time).
2. Create an `AuditRun` row in `running` state.
3. For each test case, run the **attack–defense loop** (below) and persist a
   `TestResult` with the verdict, evidence spans, raw request/response, latency,
   and score impact.
4. Aggregate the per-case impacts into a 0–100 score + risk tier and mark the
   run `completed`.

The UI then reads the run back through server components; the export route
serializes the same data to JSON / CSV / Markdown for CI gating.

## The audit pipeline (`lib/audit/`)

| Module | Responsibility |
|---|---|
| `attack-defense.ts` | Orchestrates the ≤3-round loop per case: execute → score → escalate. |
| `executor.ts` | Sends the prompt to the target: simulator, OpenAI model, or HTTP endpoint. Contains the SSRF allowlist for user-supplied endpoints. |
| `prompt-mutator.ts` | Rewrites a non-passing attack into a harder variant (jailbreak-prefix → role-switch → boundary-escape). |
| `scorer.ts` | Chooses the evaluator: regex heuristics by default, LLM-as-judge when a key is set. |
| `judge.ts` | LLM-as-judge grader (strict rubric, JSON output). |
| `evaluator.ts` (in `lib/`) | Deterministic regex heuristic evaluator — the $0 fallback. |
| `aggregate.ts` | Sums severity-weighted impacts into the normalized score + tier. |
| `reporter.ts` | Builds the Markdown report for export. |
| `versioning.ts` | Stamps suite / evaluator / execution versions onto each run. |

### The attack–defense loop

For each case, round 1 sends the raw attack. If the response is not a clean
refusal, two things happen before the retry: the **prompt-mutator** transforms
the attack into a harder variant, and an **auto-defense patch** hardens the
target's own instructions (blocked terms, strict-refusal mode). This models the
back-and-forth of real red-teaming rather than a single static probe. The loop
stops early on a pass or an execution failure, and caps at 3 rounds.

## Execution modes

- **Simulator (default, $0).** A deterministic stand-in target. No API key, no
  network, no spend — the entire pipeline is demonstrable offline.
- **OpenAI live.** Set `OPENAI_API_KEY` to audit a real model (`gpt-4o-mini` by
  default). Bounded by a per-process USD circuit-breaker (`OPENAI_MAX_USD`).
- **HTTP endpoint.** Point at any chat endpoint with a `{{prompt}}` request
  template. The executor validates the URL against an SSRF allowlist (rejecting
  private, loopback, link-local, and cloud-metadata hosts) before calling it.

## Data model (`prisma/schema.prisma`)

```
Project ─1:1─ TargetConfig
   │
   └─1:N─ AuditRun ─1:N─ TestResult ─N:1─ TestCase
```

- **Project / TargetConfig** — the surface under test and its configuration.
- **AuditRun** — one execution of the suite; holds the score, tier, and pinned
  pipeline versions.
- **TestCase** — a seeded adversarial case (30 in the default suite).
- **TestResult** — the graded outcome of one case in one run, with raw payloads
  and evidence stored as serialized JSON.

SQLite is the default (`file:./dev.db`); the provider swaps to Postgres with a
one-line datasource change for a shared writable deployment.

## Frontend

- `app/page.tsx` — marketing landing (`PageShell`).
- `app/(app)/*` — the dashboard route group wrapped in `DashboardShell`
  (sidebar + topbar): create/configure/run a project, view a run dashboard, and
  drill into a finding.
- `components/ui/*` — design-system primitives (cards, badges, score ring,
  charts) on a light editorial theme defined in `tailwind.config.ts`.

## CI

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on every push and
PR to `main`: **type-check** (`tsc --noEmit`), **Next.js build** (with a Prisma
`db push`), and a **dependency audit** (`npm audit`, non-blocking for now).
Production deploys from `main` via Vercel.
