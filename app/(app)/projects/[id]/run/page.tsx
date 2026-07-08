import { prisma } from "@/lib/prisma";
import { getDefaultSuite } from "@/lib/test-suite";
import { runAudit } from "@/lib/actions";
import { redirect } from "next/navigation";
import { isLiveMode } from "@/lib/audit/openai-client";
import { DEFAULT_MODEL } from "@/lib/audit/openai-client";
import { Card, Eyebrow, EmptyState } from "@/components/ui/base";
import { RunSubmit } from "@/components/run-overlay";
import { Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) {
    return <EmptyState icon={Inbox} title="Project not found" body="This project may have been removed." />;
  }

  const tests = await getDefaultSuite();
  const categories = Array.from(new Set(tests.map((t) => t.category)));
  const categoryDetails = categories.map((category) => {
    const matching = tests.filter((t) => t.category === category);
    return {
      category,
      count: matching.length,
      high: matching.filter((t) => t.severity === "high").length
    };
  });

  const live = isLiveMode();

  const action = async (formData: FormData) => {
    "use server";
    const selected = formData.getAll("categories") as string[];
    const res = await runAudit(project.id, selected.length ? selected : undefined);
    redirect(`/audit-runs/${res.runId}`);
  };

  return (
    <div className="mx-auto max-w-[900px]">
      <Eyebrow>Run audit · step 3 of 3</Eyebrow>
      <h1 className="mt-3 text-[1.8125rem] font-[720] tracking-[-0.02em] text-ink">Executing adversarial suites</h1>
      <p className="mt-2 text-[0.9375rem] leading-6 text-ink-3">
        Select the active categories, then run the suite: target execution, evidence capture, scoring, and aggregation.
      </p>

      <form action={action} className="mt-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 bg-canvas">
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Spend model</p>
              <p className="mt-1 text-sm font-medium text-ink">
                {live ? `OpenAI live · ${DEFAULT_MODEL}` : "No-cost demo mode"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Pipeline</p>
              <p className="mt-1 text-sm font-medium text-ink">
                Attack-defense loop → {live ? "LLM-judge" : "heuristic"} scorer → aggregator
              </p>
            </div>
          </Card>

          {categoryDetails.map((item) => (
            <label
              key={item.category}
              className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-surface p-4 hover:bg-canvas"
            >
              <input
                type="checkbox"
                name="categories"
                value={item.category}
                defaultChecked
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{item.category}</p>
                <p className="mt-1 font-mono text-xs text-ink-4">
                  {item.count} cases · {item.high} high severity
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ink-4">
            Each run snapshots the target config and pipeline versions for comparison.
          </p>
          <RunSubmit suites={categories} />
        </div>
      </form>
    </div>
  );
}
