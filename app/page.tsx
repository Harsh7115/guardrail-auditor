import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, FileSpreadsheet } from "lucide-react";
import { ScoreBadge } from "@/components/score-badge";

export default function Home() {
  const highlights = [
    { title: "Prompt Injection", body: "Auto-detect jailbreak attempts with layered refusal heuristics." },
    { title: "Data Leakage", body: "Guard against credential, PII, and secret exfiltration." },
    { title: "Grounding Fidelity", body: "Verify answers stay aligned with retrieved context." }
  ];

  return (
    <main className="space-y-12">
      <section className="gradient-hero rounded-3xl p-10 shadow-card border border-slate-100">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
              <ShieldCheck size={16} /> Enterprise AI Safety
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
              Audit your LLM apps for real-world safety gaps.
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Guardrail Auditor stress-tests prompts, endpoints, and RAG pipelines. Get category scores, verdicts, and actionable remediations in one dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/projects/new" className="button-primary">
                Create Audit Project <ArrowRight size={16} />
              </Link>
              <Link href="/audit-runs/demo" className="button-secondary">
                View Demo Results
              </Link>
            </div>
          </div>
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Latest Demo Run</p>
                <p className="text-xl font-semibold">Enterprise Assistant</p>
              </div>
              <ScoreBadge score={72} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Pass", value: 28, tone: "text-emerald-600" },
                { label: "Warning", value: 9, tone: "text-amber-600" },
                { label: "Fail", value: 5, tone: "text-rose-600" }
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                  <p className={`text-2xl font-bold ${item.tone}`}>{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label} tests</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Activity size={18} />
              <span>Live heuristics engine · No provider required</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {highlights.map((h) => (
          <div key={h.title} className="card p-6 space-y-2">
            <h3 className="text-lg font-semibold">{h.title}</h3>
            <p className="text-sm text-slate-600">{h.body}</p>
          </div>
        ))}
      </section>

      <section className="card p-8 space-y-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="text-brand-600" />
          <div>
            <p className="text-sm text-slate-500">One-click exports</p>
            <p className="text-xl font-semibold">JSON · CSV · PDF (optional)</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 max-w-3xl">
          Share results with security, governance, and product teams. Guardrail Auditor keeps explanations tight and remediation suggestions actionable so teams can harden models quickly.
        </p>
      </section>
    </main>
  );
}
