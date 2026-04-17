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
      <div className="card card-strong flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Project</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{project.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{project.description}</p>
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

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent Runs</h2>
          <Link className="text-sm text-violet-300" href={`/projects/${project.id}/run`}>
            New run →
          </Link>
        </div>
        {project.auditRuns.length === 0 && <p className="text-sm text-slate-500">No runs yet.</p>}
        <div className="divide-y divide-white/5">
          {project.auditRuns.map((run) => (
            <div key={run.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{run.status === "completed" ? "Completed run" : "Pending run"}</p>
                <p className="text-sm text-slate-500">{formatDate(run.startedAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                {run.overallScore && <ScoreBadge score={run.overallScore} />}
                <Link className="text-sm text-violet-300" href={`/audit-runs/${run.id}`}>
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
