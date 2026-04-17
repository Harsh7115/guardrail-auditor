import { prisma } from "@/lib/prisma";
import { getDefaultSuite } from "@/lib/test-suite";
import { runAudit } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function RunPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return <p className="text-slate-600">Project not found.</p>;

  const tests = await getDefaultSuite();
  const categories = Array.from(new Set(tests.map((t) => t.category)));
  const categoryDetails = categories.map((category) => {
    const matching = tests.filter((test) => test.category === category);
    const highSeverity = matching.filter((test) => test.severity === "high").length;
    return { category, count: matching.length, highSeverity };
  });

  const action = async (formData: FormData) => {
    "use server";
    const selected = formData.getAll("categories") as string[];
    const res = await runAudit(project.id, selected.length ? selected : undefined);
    redirect(`/audit-runs/${res.runId}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="card card-strong p-7 space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Run</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Audit Project</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Select the active categories, then execute the current demo pipeline: target execution, evidence capture,
            heuristic scoring, and run aggregation.
          </p>
        </div>
        <div className="muted-panel p-4">
          <div className="key-row">
            <span className="key-label">Project</span>
            <span className="key-value">{project.name}</span>
          </div>
          <div className="key-row">
            <span className="key-label">Target mode</span>
            <span className="key-value">{project.targetType}</span>
          </div>
          <div className="key-row">
            <span className="key-label">Pipeline</span>
            <span className="key-value">Executor → Scorer → Aggregator</span>
          </div>
          <div className="key-row">
            <span className="key-label">Spend model</span>
            <span className="key-value">No-cost demo mode</span>
          </div>
        </div>
      </div>

      <form action={action} className="card p-6 space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Category selection</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">Choose the active suite</p>
        </div>
        <div className="space-y-3">
          {categoryDetails.map((item) => (
            <label key={item.category} className="muted-panel flex items-start gap-4 p-4 cursor-pointer">
              <input type="checkbox" name="categories" value={item.category} defaultChecked className="mt-1 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium text-white">{item.category}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {item.count} tests · {item.highSeverity} high severity
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="muted-panel p-4 text-sm leading-7 text-slate-400">
          Each run stores the current configuration snapshot and version metadata so future comparisons can distinguish implementation changes from scoring changes.
        </div>
        <button type="submit" className="button-primary">
          Run audit
        </button>
      </form>
    </div>
  );
}
