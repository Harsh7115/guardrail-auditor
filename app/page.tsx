import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, FileSpreadsheet, Radar, Sparkles, Blocks, ChevronRight } from "lucide-react";
import { ScoreBadge } from "@/components/score-badge";

export default function Home() {
  const highlights = [
    { title: "Prompt Injection", body: "Auto-detect jailbreak attempts with layered refusal heuristics." },
    { title: "Data Leakage", body: "Guard against credential, PII, and secret exfiltration." },
    { title: "Grounding Fidelity", body: "Verify answers stay aligned with retrieved context." }
  ];
  const catalog = [
    { name: "Red Team Packs", count: "42 scenarios", body: "Curated attack prompts tuned for assistant, support, and internal knowledge workflows." },
    { name: "Policy Checks", count: "18 rulesets", body: "Coverage for PII leakage, secrets exposure, refusal discipline, and jailbreak resilience." },
    { name: "RAG Drift", count: "9 lenses", body: "Spot unsupported claims, overreach, and retrieval mismatch before they ship." }
  ];

  return (
    <main className="space-y-8 md:space-y-10">
      <section className="gradient-hero fine-grid overflow-hidden rounded-[36px] px-6 py-8 md:px-10 md:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="eyebrow">
            <ShieldCheck size={14} /> Enterprise AI Safety
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-2">Prompt-only</span>
            <span className="rounded-full border border-white/10 px-3 py-2">Endpoint</span>
            <span className="rounded-full border border-white/10 px-3 py-2">RAG</span>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Audit interface</p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-white md:text-7xl">
                Ship safer AI systems with a darker, sharper audit surface.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Guardrail Auditor stress-tests prompts, endpoints, and retrieval flows, then turns failures into a reviewable dashboard with category scores, verdicts, and exportable evidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/projects/new" className="button-primary">
                Create Audit Project <ArrowRight size={16} />
              </Link>
              <Link href="/audit-runs/demo-run" className="button-secondary">
                View Demo Results
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="metric-tile">
                <p className="metric-kicker">Coverage</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">64</p>
                <p className="mt-2 text-sm text-slate-400">attack cases across leakage, refusal, and grounding</p>
              </div>
              <div className="metric-tile">
                <p className="metric-kicker">Latency</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">&lt; 2m</p>
                <p className="mt-2 text-sm text-slate-400">from new project to first summarized run</p>
              </div>
              <div className="metric-tile">
                <p className="metric-kicker">Outputs</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">3</p>
                <p className="mt-2 text-sm text-slate-400">JSON, CSV, and optional PDF exports for review</p>
              </div>
            </div>
          </div>
          <div className="card card-strong space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Latest Demo Run</p>
                <p className="text-2xl font-semibold tracking-tight text-white">Enterprise Assistant</p>
              </div>
              <ScoreBadge score={72} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Pass", value: 28, tone: "text-emerald-600" },
                { label: "Warning", value: 9, tone: "text-amber-600" },
                { label: "Fail", value: 5, tone: "text-rose-600" }
              ].map((item) => (
                <div key={item.label} className="metric-tile rounded-[22px] p-4">
                  <p className={`text-2xl font-bold ${item.tone}`}>{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Activity size={18} className="text-violet-300" />
              <span>Live heuristics engine · No provider required</span>
            </div>
            <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Risk map</span>
                <span>Updated 2m ago</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Injection resilience", value: "81" },
                  { label: "Data leakage controls", value: "67" },
                  { label: "Grounding fidelity", value: "72" }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.value}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((h) => (
          <div key={h.title} className="card p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-violet-200">
              {h.title === "Prompt Injection" ? <Radar size={18} /> : h.title === "Data Leakage" ? <Sparkles size={18} /> : <Blocks size={18} />}
            </div>
            <h3 className="text-lg font-semibold text-white">{h.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{h.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card overflow-hidden p-8">
          <div className="mb-8 flex items-center gap-3">
            <FileSpreadsheet className="text-violet-300" />
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">One-click exports</p>
              <p className="text-2xl font-semibold tracking-tight text-white">JSON · CSV · PDF (optional)</p>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            Share results with security, governance, and product teams. Guardrail Auditor keeps explanations tight and remediation suggestions actionable so teams can harden models quickly.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {["Executive review", "Security triage", "Model iteration"].map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="card card-strong p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Audit Catalog</p>
            <span className="text-xs text-slate-500">Inspired by a component directory layout</span>
          </div>
          <div className="space-y-3">
            {catalog.map((item) => (
              <div key={item.name} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.count}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-violet-300">
                  Explore module <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
