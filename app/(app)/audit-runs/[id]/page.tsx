import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getDemoRun } from "@/lib/demo-data";
import { Card, MetricCard, ExportButton, EmptyState, ErrorBanner } from "@/components/ui/base";
import { VerdictBadge, SeverityPill, RiskTierBadge } from "@/components/ui/badges";
import { ScoreRing } from "@/components/ui/score-ring";
import { CategoryBar } from "@/components/ui/category-bar";
import { VerdictDonut } from "@/components/ui/verdict-donut";
import { impactColor } from "@/lib/verdict";
import { ChevronRight, Lightbulb, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditRunPage({ params }: { params: { id: string } }) {
  let run = null;
  try {
    run = await prisma.auditRun.findUnique({
      where: { id: params.id },
      include: { project: true, results: { include: { testCase: true } } }
    });
  } catch {
    // Unreadable DB (read-only hosted demo) — fall through to demo fallback / not found.
  }
  if (!run && params.id === "demo-run") run = getDemoRun();

  if (!run) {
    return (
      <EmptyState
        icon={Inbox}
        title="Audit run not found"
        body="This run may have been removed, or the link is out of date. Explore the demo run to see a full report."
        action={
          <Link
            href="/audit-runs/demo-run"
            className="rounded-control bg-ink px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-black/90"
          >
            View demo run
          </Link>
        }
      />
    );
  }

  const results = run.results;
  const total = results.length;

  const verdictCounts = results.reduce(
    (acc, r) => {
      const v = r.verdict === "pass" || r.verdict === "fail" ? r.verdict : "warning";
      acc[v] += 1;
      return acc;
    },
    { pass: 0, warning: 0, fail: 0 }
  );

  // Category pass-rate (%) for the breakdown bars.
  const catAgg = results.reduce<Record<string, { pass: number; count: number }>>((acc, r) => {
    const base = acc[r.category] ?? { pass: 0, count: 0 };
    if (r.verdict === "pass") base.pass += 1;
    base.count += 1;
    acc[r.category] = base;
    return acc;
  }, {});
  const categoryBars = Object.entries(catAgg).map(([category, { pass, count }]) => ({
    category,
    pct: count ? (pass / count) * 100 : 0,
    meta: `${pass}/${count}`
  }));

  const latencies = results.filter((r) => r.latencyMs != null);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((s, r) => s + (r.latencyMs ?? 0), 0) / latencies.length)
    : null;

  // Tests where the target itself errored (never produced a gradable response).
  // These must NOT read as "safe" — a target that couldn't be tested is
  // inconclusive, not low-risk.
  const errored = results.filter((r) => r.executionStatus === "failed").length;
  const allErrored = total > 0 && errored === total;

  const topFindings = results
    .filter((r) => r.verdict !== "pass")
    .sort((a, b) => b.scoreImpact - a.scoreImpact)
    .slice(0, 6);

  const remediation = topFindings.slice(0, 4).map((f) => ({
    priority: f.verdict === "fail" ? "P0" : "P1",
    tone: f.verdict === "fail" ? "bg-fail-soft text-fail" : "bg-warn-soft text-warn",
    title: f.testCase.name,
    text: f.remediation
  }));

  const durationSec =
    run.completedAt && run.startedAt
      ? ((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-[720] tracking-[-0.02em] text-ink">Audit dashboard</h1>
          <p className="mt-1.5 font-mono text-xs text-ink-4">
            {run.project.name} · {formatDate(run.startedAt)}
            {" · "}
            {total} cases{durationSec ? ` · ${durationSec}s` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton href={`/api/audit-runs/${run.id}/export?format=json`} label="JSON" />
          <ExportButton href={`/api/audit-runs/${run.id}/export?format=csv`} label="CSV" />
          <ExportButton href={`/api/audit-runs/${run.id}/export?format=md`} label="Report" />
        </div>
      </div>

      {/* Execution-error notice — a target that couldn't be tested is not "safe". */}
      {errored > 0 && (
        <ErrorBanner
          title={
            allErrored
              ? "Target could not be tested"
              : `${errored} of ${total} tests could not execute`
          }
          body={
            allErrored
              ? "Every request to the target errored, so no safety verdicts were produced. The result is inconclusive — check the target configuration and re-run."
              : "The target returned errors on some tests. The safety score reflects only the tests that actually ran."
          }
        />
      )}

      {/* Row 1: score + metrics */}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_2fr]">
        <Card className="flex items-center gap-6">
          {allErrored ? (
            <div className="grid h-[156px] w-[156px] shrink-0 place-items-center rounded-full border-4 border-line-3 text-center">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-4">No score</span>
            </div>
          ) : (
            <ScoreRing score={run.overallScore ?? 0} />
          )}
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Safety score</p>
            <div className="mt-2">
              {allErrored ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-line-3 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wide text-ink-3">
                  Inconclusive
                </span>
              ) : (
                <RiskTierBadge tier={run.riskTier} />
              )}
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-3">
              {allErrored
                ? "No verdicts were produced — the target could not be reached."
                : verdictCounts.fail > 0
                  ? `${verdictCounts.fail} failing checks need remediation before release.`
                  : verdictCounts.warning > 0
                    ? `No hard failures; ${verdictCounts.warning} warnings to tighten.`
                    : "All checks passed against the current suite."}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MetricCard label="Tests executed" value={total} />
          <MetricCard label="Passed" value={verdictCounts.pass} valueClassName="text-pass" />
          <MetricCard label="Warnings" value={verdictCounts.warning} valueClassName="text-warn" />
          <MetricCard label="Failed" value={verdictCounts.fail} valueClassName="text-fail" />
          <MetricCard
            label="Avg latency"
            value={avgLatency == null ? "—" : avgLatency < 1 ? "<1ms" : `${avgLatency}ms`}
          />
          <MetricCard
            label="Risk tier"
            value={allErrored ? "Inconclusive" : (run.riskTier ?? "—")}
            valueClassName="text-2xl"
          />
        </div>
      </div>

      {/* Row 2: category breakdown + verdict donut */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <p className="text-sm font-semibold text-ink">Category breakdown</p>
          <p className="mt-0.5 text-xs text-ink-4">Pass rate by attack category</p>
          <div className="mt-4 divide-y divide-line-3">
            {categoryBars.map((c) => (
              <CategoryBar key={c.category} label={c.category} pct={c.pct} meta={c.meta} />
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-ink">Verdict split</p>
          <div className="mt-4">
            <VerdictDonut counts={verdictCounts} />
          </div>
        </Card>
      </div>

      {/* Top findings */}
      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-line-3 px-6 py-4">
          <p className="text-sm font-semibold text-ink">Top findings</p>
          <span className="font-mono text-xs text-ink-4">
            {topFindings.length} of {verdictCounts.warning + verdictCounts.fail} issues
          </span>
        </div>
        {topFindings.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ink-4">No warnings or failures in this run.</p>
        ) : (
          <ul>
            {topFindings.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/audit-runs/${run!.id}/results/${f.id}`}
                  className="flex items-center gap-4 border-b border-line-3 px-6 py-3.5 last:border-b-0 hover:bg-canvas"
                >
                  <VerdictBadge verdict={f.verdict} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{f.testCase.name}</p>
                    <p className="truncate font-mono text-xs text-ink-4">
                      {f.category} · conf {f.confidence.toFixed(2)}
                    </p>
                  </div>
                  <SeverityPill severity={f.severity} />
                  <span className={`w-12 text-right font-mono text-sm ${impactColor(f.scoreImpact)}`}>
                    −{f.scoreImpact.toFixed(0)}
                  </span>
                  <ChevronRight size={16} className="text-ink-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Remediation summary */}
      {remediation.length > 0 && (
        <div className="rounded-card border border-accent/20 bg-accent-soft p-6">
          <div className="flex items-center gap-2">
            <Lightbulb size={17} className="text-accent" strokeWidth={2} />
            <p className="text-sm font-semibold text-ink">Remediation summary</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {remediation.map((r, i) => (
              <div key={i} className="flex gap-3 rounded-control border border-line bg-surface p-3.5">
                <span className={`h-fit rounded-md px-2 py-0.5 font-mono text-[0.656rem] font-bold ${r.tone}`}>
                  {r.priority}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-ink-3">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full results */}
      <Card className="p-0">
        <p className="border-b border-line-3 px-6 py-4 text-sm font-semibold text-ink">All results</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-3 text-left font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">
                <th className="px-6 py-2.5 font-medium">Test</th>
                <th className="px-3 py-2.5 font-medium">Category</th>
                <th className="px-3 py-2.5 font-medium">Verdict</th>
                <th className="px-3 py-2.5 font-medium">Severity</th>
                <th className="px-3 py-2.5 font-medium">Conf</th>
                <th className="px-6 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-line-3 last:border-b-0 hover:bg-canvas">
                  <td className="px-6 py-3 font-medium text-ink">{r.testCase.name}</td>
                  <td className="px-3 py-3 text-ink-3">{r.category}</td>
                  <td className="px-3 py-3">
                    <VerdictBadge verdict={r.verdict} />
                  </td>
                  <td className="px-3 py-3">
                    <SeverityPill severity={r.severity} />
                  </td>
                  <td className="px-3 py-3 font-mono text-ink-3">{r.confidence.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/audit-runs/${run!.id}/results/${r.id}`}
                      className="font-mono text-xs text-accent hover:text-accent-hover"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
