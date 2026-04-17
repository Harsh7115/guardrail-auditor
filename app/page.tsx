import Link from "next/link";
import {
  Activity,
  ArrowRight,
  FileSpreadsheet,
  Radar,
  ShieldCheck,
  Waypoints,
  Workflow,
  Wrench
} from "lucide-react";
import { ScoreBadge } from "@/components/score-badge";

const controls = [
  {
    title: "Target execution",
    body: "Run prompts against deterministic demo targets or generic HTTP endpoints without adding provider spend."
  },
  {
    title: "Evidence capture",
    body: "Persist raw request and response data, normalized output, latency, provider identity, and execution status."
  },
  {
    title: "Heuristic scoring",
    body: "Evaluate refusal strength, leakage risk, role bypass, and unsupported RAG claims with explicit verdict logic."
  }
];

const workflow = [
  "Define a target and configuration snapshot",
  "Select categories and assemble the active suite",
  "Execute each test case through the pipeline",
  "Score outputs and persist structured evidence",
  "Export the run for review, triage, and iteration"
];

export default function Home() {
  return (
    <main className="space-y-6 md:space-y-8">
      <section className="gradient-hero overflow-hidden rounded-[36px] px-6 py-8 md:px-10 md:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="eyebrow">
            <ShieldCheck size={14} /> Safety audit platform
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-2">No provider cost</span>
            <span className="rounded-full border border-white/10 px-3 py-2">Pipeline-backed runs</span>
            <span className="rounded-full border border-white/10 px-3 py-2">Structured evidence</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Guardrail operations</p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white md:text-6xl">
                Practical safety auditing for prompt, endpoint, and RAG systems.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Guardrail Auditor is a no-cost demo environment for exercising high-risk prompt flows, preserving execution evidence,
                and reviewing results in a repeatable audit pipeline.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/projects/new" className="button-primary">
                Create Audit Project <ArrowRight size={16} />
              </Link>
              <Link href="/audit-runs/demo-run" className="button-secondary">
                Review Demo Run
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="metric-tile">
                <p className="metric-kicker">Execution modes</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">3</p>
                <p className="mt-2 text-sm text-slate-400">Prompt-only, endpoint, and retrieval-grounded flows</p>
              </div>
              <div className="metric-tile">
                <p className="metric-kicker">Evidence depth</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">10+</p>
                <p className="mt-2 text-sm text-slate-400">Structured fields captured per result, including metadata and spans</p>
              </div>
              <div className="metric-tile">
                <p className="metric-kicker">Demo posture</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">$0</p>
                <p className="mt-2 text-sm text-slate-400">No paid model integrations required to understand the workflow</p>
              </div>
            </div>
          </div>

          <div className="card card-strong space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Latest demo run</p>
                <p className="text-2xl font-semibold tracking-tight text-white">Enterprise Assistant</p>
              </div>
              <ScoreBadge score={72} />
            </div>

            <div className="muted-panel p-4">
              <div className="key-row">
                <span className="key-label">Pipeline</span>
                <span className="key-value">Executor → Scorer → Aggregator</span>
              </div>
              <div className="key-row">
                <span className="key-label">Provider mode</span>
                <span className="key-value">Simulated / Generic HTTP</span>
              </div>
              <div className="key-row">
                <span className="key-label">Exports</span>
                <span className="key-value">JSON, CSV, optional PDF</span>
              </div>
              <div className="key-row">
                <span className="key-label">Execution cost</span>
                <span className="key-value">Demo-safe</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <Activity size={18} className="text-violet-300" />
              <span>Evidence is persisted per test case, not just summarized at the run level.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {controls.map((item, index) => (
          <div key={item.title} className="card p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-violet-200">
              {index === 0 ? <Workflow size={18} /> : index === 1 ? <Radar size={18} /> : <Wrench size={18} />}
            </div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card p-8">
          <div className="mb-6 flex items-center gap-3">
            <Waypoints className="text-violet-300" />
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">How it works</p>
              <p className="text-2xl font-semibold tracking-tight text-white">A repeatable audit path, not just a scorecard</p>
            </div>
          </div>
          <div className="space-y-3">
            {workflow.map((step, index) => (
              <div key={step} className="muted-panel flex items-start gap-4 p-4">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-xs font-semibold text-slate-200">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-strong p-8">
          <div className="mb-6 flex items-center gap-3">
            <FileSpreadsheet className="text-violet-300" />
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Implementation focus</p>
              <p className="text-2xl font-semibold tracking-tight text-white">Built to demonstrate depth without cloud spend</p>
            </div>
          </div>
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              The current demo preserves run versions, target snapshots, execution metadata, evidence spans, and remediation suggestions.
              That gives the product a credible backbone before any paid provider adapters are introduced.
            </p>
            <p>
              The next step is straightforward: swap the simulated executor for real provider adapters with spend controls,
              while keeping the same scoring and reporting layers.
            </p>
          </div>
          <div className="mt-6 code-panel">
            {`runAudit()
 ├─ executeTestCase()
 ├─ scoreExecution()
 ├─ persist TestResult evidence
 └─ aggregateRun()`}
          </div>
        </div>
      </section>
    </main>
  );
}
