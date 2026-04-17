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

  return (
    <div className="space-y-6">
      <div className="card card-strong flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Audit run</p>
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

      <AuditCharts categoryScores={byCategory} verdictCounts={verdictCounts} overall={run.overallScore ?? 0} />

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
  );
}
