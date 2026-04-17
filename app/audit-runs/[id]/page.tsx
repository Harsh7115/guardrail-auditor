import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ScoreBadge } from "@/components/score-badge";
import { StatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/utils";
import { AuditCharts } from "@/components/charts";

export default async function AuditRunPage({ params }: { params: { id: string } }) {
  const run = await prisma.auditRun.findUnique({
    where: { id: params.id },
    include: { project: true, results: { include: { testCase: true } } }
  });
  if (!run) return <p className="text-slate-600">Audit run not found.</p>;

  const byCategory = run.results.reduce<Record<string, { score: number; count: number }>>((acc, r) => {
    const base = acc[r.category] ?? { score: 100, count: 0 };
    base.score = Math.max(0, base.score - r.scoreImpact);
    base.count += 1;
    acc[r.category] = base;
    return acc;
  }, {});

  const verdictCounts = run.results.reduce(
    (acc, r) => ({ ...acc, [r.verdict]: (acc as any)[r.verdict] + 1 }),
    { pass: 0, warning: 0, fail: 0 }
  );

  const avgLatency =
    run.results.filter((result) => result.latencyMs != null).reduce((sum, result) => sum + (result.latencyMs ?? 0), 0) /
    Math.max(run.results.filter((result) => result.latencyMs != null).length, 1);

  const topFindings = run.results
    .filter((result) => result.verdict !== "pass")
    .sort((a, b) => b.scoreImpact - a.scoreImpact)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="card card-strong flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="surface-header">Audit run</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{run.project.name}</h1>
          <p className="mt-3 text-sm text-slate-300">Started {formatDate(run.startedAt)}</p>
          <p className="text-sm text-slate-500">Risk tier: {run.riskTier}</p>
        </div>
        <div className="flex items-center gap-3">
          {run.overallScore != null && <ScoreBadge score={run.overallScore} />}
          <Link className="button-secondary" href={`/projects/${run.projectId}`}>
            Back to project
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-5">
          <p className="metric-kicker">Tests executed</p>
          <p className="mt-3 text-2xl font-semibold text-white">{run.results.length}</p>
          <p className="mt-2 text-sm text-slate-400">Each result stores execution payloads and scoring metadata.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Failures</p>
          <p className="mt-3 text-2xl font-semibold text-white">{verdictCounts.fail}</p>
          <p className="mt-2 text-sm text-slate-400">The current run keeps its highest-risk findings reviewable in detail.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Average latency</p>
          <p className="mt-3 text-2xl font-semibold text-white">{Number.isFinite(avgLatency) ? `${Math.round(avgLatency)} ms` : "-"}</p>
          <p className="mt-2 text-sm text-slate-400">Execution timing is captured when the executor returns it.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Versions</p>
          <p className="mt-3 text-lg font-semibold text-white">{run.executionVersion}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">{run.evaluatorVersion}</p>
        </div>
      </div>

      <AuditCharts categoryScores={byCategory} verdictCounts={verdictCounts} overall={run.overallScore ?? 0} />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="card p-6">
          <h2 className="section-title">Execution timeline</h2>
          <div className="mt-5 space-y-5">
            <div className="timeline-row">
              <p className="font-medium text-white">Run initialized</p>
              <p className="mt-1 text-sm text-slate-400">{formatDate(run.startedAt)} · target snapshot persisted</p>
            </div>
            <div className="timeline-row">
              <p className="font-medium text-white">Target execution</p>
              <p className="mt-1 text-sm text-slate-400">Tests executed through the current demo executor strategy.</p>
            </div>
            <div className="timeline-row">
              <p className="font-medium text-white">Heuristic scoring</p>
              <p className="mt-1 text-sm text-slate-400">Verdicts generated with versioned evaluator logic and evidence spans.</p>
            </div>
            <div className="timeline-row">
              <p className="font-medium text-white">Aggregation and export</p>
              <p className="mt-1 text-sm text-slate-400">
                Overall score, risk tier, and structured results finalized {run.completedAt ? `at ${formatDate(run.completedAt)}` : "during run completion"}.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">Run metadata</h2>
          <div className="mt-4">
            <div className="key-row">
              <span className="key-label">Started</span>
              <span className="key-value">{formatDate(run.startedAt)}</span>
            </div>
            <div className="key-row">
              <span className="key-label">Completed</span>
              <span className="key-value">{formatDate(run.completedAt)}</span>
            </div>
            <div className="key-row">
              <span className="key-label">Suite</span>
              <span className="key-value">{run.suiteVersion}</span>
            </div>
            <div className="key-row">
              <span className="key-label">Evaluator</span>
              <span className="key-value">{run.evaluatorVersion}</span>
            </div>
          </div>
          <div className="mt-5">
            <p className="surface-header">Target snapshot</p>
            <div className="code-panel mt-3">{JSON.stringify(run.targetSnapshot, null, 2)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <h2 className="section-title">Priority findings</h2>
          <div className="mt-4 space-y-3">
            {topFindings.length === 0 && <p className="text-sm text-slate-500">No warnings or failures were recorded in this run.</p>}
            {topFindings.map((finding) => (
              <div key={finding.id} className="muted-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{finding.testCase.name}</p>
                  <StatusPill verdict={finding.verdict as any} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{finding.category}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{finding.explanation}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Score impact {finding.scoreImpact.toFixed(1)}</span>
                  <Link className="text-violet-300" href={`/audit-runs/${run.id}/results/${finding.id}`}>
                    Review detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Test results</h2>
            <div className="flex gap-3 text-sm">
              <Link href={`/api/audit-runs/${run.id}/export?format=json`} className="text-violet-300">
                Export JSON
              </Link>
              <Link href={`/api/audit-runs/${run.id}/export?format=csv`} className="text-violet-300">
                Export CSV
              </Link>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Category</th>
                <th>Verdict</th>
                <th>Severity</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Confidence</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {run.results.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.testCase.name}</td>
                  <td className="text-slate-500">{r.category}</td>
                  <td>
                    <StatusPill verdict={r.verdict as any} />
                  </td>
                  <td className="text-slate-500">{r.severity}</td>
                  <td className="text-slate-500">{r.providerName ?? "-"}</td>
                  <td className="text-slate-500">{r.executionStatus}</td>
                  <td className="text-slate-500">{r.confidence.toFixed(2)}</td>
                  <td className="text-right">
                    <Link className="text-sm text-violet-300" href={`/audit-runs/${run.id}/results/${r.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
