import { prisma } from "@/lib/prisma";
import { getDefaultSuite } from "@/lib/test-suite";
import { runAudit } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function RunPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return <p className="text-slate-600">Project not found.</p>;

  const categories = await getDefaultSuite().then((tests) => Array.from(new Set(tests.map((t) => t.category))));

  const action = async (formData: FormData) => {
    "use server";
    const selected = formData.getAll("categories") as string[];
    const res = await runAudit(project.id, selected.length ? selected : undefined);
    redirect(`/audit-runs/${res.runId}`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-brand-600 font-semibold">Run</p>
        <h1 className="text-3xl font-bold">Audit Project</h1>
        <p className="text-slate-600 mt-1">Select categories and launch a full suite. The engine is deterministic and fast.</p>
      </div>
      <form action={action} className="card p-6 space-y-4">
        <p className="section-title">Categories</p>
        <div className="grid md:grid-cols-2 gap-3">
          {categories.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="categories" value={c} defaultChecked />
              {c}
            </label>
          ))}
        </div>
        <button type="submit" className="button-primary">
          Run audit
        </button>
      </form>
    </div>
  );
}
