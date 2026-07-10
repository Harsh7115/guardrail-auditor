import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getDemoProject } from "@/lib/demo-data";
import { Card, MetricCard, Button, EmptyState } from "@/components/ui/base";
import { RiskTierBadge } from "@/components/ui/badges";
import { Play, Settings2, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  let project = null;
  let isDemoFallback = false;

  try {
    project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { auditRuns: { orderBy: { startedAt: "desc" }, take: 8 }, targetConfig: true }
    });
  } catch {
    // Unreadable DB (read-only hosted demo) — fall through to demo fallback or
    // a clean "not found" instead of a 500.
  }

  if (!project && params.id === "demo-project") {
    project = getDemoProject();
    isDemoFallback = true;
  }

  if (!project) {
    return <EmptyState icon={Inbox} title="Project not found" body="This project may have been removed." />;
  }

  const latestRun = project.auditRuns[0] ?? null;
  const previousRun = project.auditRuns[1] ?? null;
  const scoreDelta =
    latestRun?.overallScore != null && previousRun?.overallScore != null
      ? Math.round((latestRun.overallScore - previousRun.overallScore) * 10) / 10
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-[720] tracking-[-0.02em] text-ink">{project.name}</h1>
          {project.description && <p className="mt-1.5 max-w-2xl text-[0.9375rem] leading-6 text-ink-3">{project.description}</p>}
          <p className="mt-1.5 font-mono text-xs text-ink-4">Target · {project.targetType}</p>
        </div>
        {!isDemoFallback && (
          <div className="flex gap-2">
            <Button href={`/projects/${project.id}/configure`} variant="secondary" icon={Settings2}>
              Configure
            </Button>
            <Button href={`/projects/${project.id}/run`} variant="primary" icon={Play}>
              Run audit
            </Button>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Target mode" value={project.targetType} valueClassName="text-2xl" />
        <MetricCard label="Latest score" value={latestRun?.overallScore != null ? Math.round(latestRun.overallScore) : "—"} />
        <MetricCard
          label="Score delta"
          value={scoreDelta == null ? "—" : scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`}
          valueClassName={scoreDelta == null ? undefined : scoreDelta >= 0 ? "text-pass" : "text-fail"}
        />
        <MetricCard label="Configuration" value={project.targetConfig ? "Ready" : "Pending"} valueClassName="text-2xl" />
      </div>

      {/* Run history */}
      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-line-3 px-6 py-4">
          <p className="text-sm font-semibold text-ink">Run history</p>
          {!isDemoFallback && (
            <Link href={`/projects/${project.id}/run`} className="font-mono text-xs text-accent hover:text-accent-hover">
              New run →
            </Link>
          )}
        </div>
        {project.auditRuns.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ink-4">No runs yet.</p>
        ) : (
          <ul>
            {project.auditRuns.map((run) => (
              <li key={run.id}>
                <Link
                  href={`/audit-runs/${run.id}`}
                  className="flex items-center gap-4 border-b border-line-3 px-6 py-4 last:border-b-0 hover:bg-canvas"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      {run.status === "completed" ? "Completed run" : "Run"}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-ink-4">
                      {formatDate(run.startedAt)} · {run.executionVersion}
                    </p>
                  </div>
                  <RiskTierBadge tier={run.riskTier} />
                  <span className="w-14 text-right font-mono text-sm text-ink-2">
                    {run.overallScore != null ? Math.round(run.overallScore) : "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
