import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ScoreBadge } from "@/components/score-badge";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { auditRuns: { orderBy: { startedAt: "desc" }, take: 3 } }
  });

  if (!project) {
    return <p className="text-slate-600">Project not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-600 font-semibold">Project</p>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-slate-600 mt-1">{project.description}</p>
          <p className="text-sm text-slate-500 mt-2">Target: {project.targetType}</p>
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

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent Runs</h2>
          <Link className="text-brand-600 text-sm" href={`/projects/${project.id}/run`}>
            New run →
          </Link>
        </div>
        {project.auditRuns.length === 0 && <p className="text-sm text-slate-500">No runs yet.</p>}
        <div className="divide-y divide-slate-100">
          {project.auditRuns.map((run) => (
            <div key={run.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{run.status === "completed" ? "Completed run" : "Pending run"}</p>
                <p className="text-sm text-slate-500">{formatDate(run.startedAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                {run.overallScore && <ScoreBadge score={run.overallScore} />}
                <Link className="text-brand-600 text-sm" href={`/audit-runs/${run.id}`}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
