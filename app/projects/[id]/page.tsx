import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ScoreBadge } from "@/components/score-badge";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { auditRuns: { orderBy: { startedAt: "desc" }, take: 8 }, targetConfig: true }
  });

  if (!project) {
    return <p className="text-slate-600">Project not found.</p>;
  }

  const latestRun = project.auditRuns[0] ?? null;
  const previousRun = project.auditRuns[1] ?? null;
  const scoreDelta =
    latestRun?.overallScore != null && previousRun?.overallScore != null
      ? Math.round((latestRun.overallScore - previousRun.overallScore) * 10) / 10
      : null;

  const recentRiskSummary = project.auditRuns.slice(0, 5).reduce<Record<string, number>>((acc, run) => {
    const tier = run.riskTier ?? "Unknown";
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="card card-strong flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="surface-header">Project</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{project.name}</h1>
          <p className="mt-3 max-w-2xl surface-copy">{project.description}</p>
          <p className="mt-3 text-sm text-slate-500">Target: {project.targetType}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/projects/${project.id}/configure`} className="button-secondary">
            Configure Target
          </Link>
          <Link href={`/projects/${project.id}/run`} className="button-primary">
            Run Audit
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-5">
          <p className="metric-kicker">Target mode</p>
          <p className="mt-3 text-2xl font-semibold text-white">{project.targetType}</p>
          <p className="mt-2 text-sm text-slate-400">Configuration is snapshotted into each run for audit traceability.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Latest score</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {latestRun?.overallScore != null ? Math.round(latestRun.overallScore) : "-"}
          </p>
          <p className="mt-2 text-sm text-slate-400">Most recent recorded outcome for this target configuration.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Score delta</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {scoreDelta == null ? "-" : scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`}
          </p>
          <p className="mt-2 text-sm text-slate-400">Change from the previous run to support regression checks.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Configuration readiness</p>
          <p className="mt-3 text-2xl font-semibold text-white">{project.targetConfig ? "Configured" : "Pending"}</p>
          <p className="mt-2 text-sm text-slate-400">Prompt, endpoint, or RAG details can be updated before execution.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Run history</h2>
            <Link className="text-sm text-violet-300" href={`/projects/${project.id}/run`}>
              New run →
            </Link>
          </div>
          {project.auditRuns.length === 0 && <p className="mt-4 text-sm text-slate-500">No runs yet.</p>}
          <div className="mt-4 divide-y divide-white/5">
            {project.auditRuns.map((run, index) => {
              const nextRun = project.auditRuns[index + 1];
              const delta =
                run.overallScore != null && nextRun?.overallScore != null
                  ? Math.round((run.overallScore - nextRun.overallScore) * 10) / 10
                  : null;

              return (
                <div key={run.id} className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{run.status === "completed" ? "Completed run" : "Pending run"}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(run.startedAt)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-600">
                      {run.executionVersion ?? "modular-executor@v1"} · {run.evaluatorVersion ?? "heuristic-evaluator@v2"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Risk</p>
                      <p className="text-sm text-slate-200">{run.riskTier ?? "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Delta</p>
                      <p className="text-sm text-slate-200">
                        {delta == null ? "-" : delta > 0 ? `+${delta}` : `${delta}`}
                      </p>
                    </div>
                    {run.overallScore != null && <ScoreBadge score={run.overallScore} />}
                    <Link className="text-sm text-violet-300" href={`/audit-runs/${run.id}`}>
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">Program summary</h2>
          <div className="mt-4 space-y-4">
            <div className="muted-panel p-4">
              <p className="surface-header">Recent risk distribution</p>
              <div className="mt-4 space-y-3">
                {Object.entries(recentRiskSummary).length === 0 && (
                  <p className="text-sm text-slate-500">Risk tiers will populate after the first completed run.</p>
                )}
                {Object.entries(recentRiskSummary).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{tier}</span>
                    <span className="text-slate-200">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="muted-panel p-4">
              <p className="surface-header">What this page is for</p>
              <p className="mt-3 surface-copy">
                Use the project view to review run history, compare score movement over time, and confirm that the current target configuration is suitable before launching the next audit cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
