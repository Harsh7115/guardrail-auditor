import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getDemoResult } from "@/lib/demo-data";
import { parseStructuredData } from "@/lib/utils";
import { Card, MetricCard, EmptyState } from "@/components/ui/base";
import { VerdictBadge, SeverityPill } from "@/components/ui/badges";
import { impactColor, normalizeVerdict, verdictStyle } from "@/lib/verdict";
import {
  ChevronDown,
  ChevronLeft,
  Lightbulb,
  Send,
  MessageSquare,
  ScanSearch,
  Wrench,
  Inbox
} from "lucide-react";

export const dynamic = "force-dynamic";

type Span = { label?: string; excerpt?: string };
type Round = {
  round: number;
  attackPrompt?: string;
  verdict?: string;
  defenseApplied?: boolean;
  mutationStrategy?: string;
  responsePreview?: string;
  executionStatus?: string;
};

// Highlight the evidence excerpt inside the response text (first occurrence).
// Stable 4-char hex id for display (e.g. finding_2f91), derived from the full
// result id so it's deterministic but readable — not a raw id tail.
function shortHash(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 4);
}

function HighlightedResponse({ text, excerpt }: { text: string; excerpt?: string }) {
  if (!excerpt || !text.includes(excerpt)) {
    return <span className="whitespace-pre-wrap">{text || "(empty response)"}</span>;
  }
  const idx = text.indexOf(excerpt);
  return (
    <span className="whitespace-pre-wrap">
      {text.slice(0, idx)}
      <mark className="rounded bg-fail-soft px-1 text-[#8B2019]">{excerpt}</mark>
      {text.slice(idx + excerpt.length)}
    </span>
  );
}

export default async function ResultDetailPage({ params }: { params: { id: string; resultId: string } }) {
  let result = null;
  try {
    result = await prisma.testResult.findUnique({
      where: { id: params.resultId },
      include: { testCase: true, auditRun: { include: { project: true } } }
    });
  } catch (error) {
    if (params.id !== "demo-run") throw error;
  }
  if (!result && params.id === "demo-run") result = getDemoResult(params.resultId);

  if (!result) {
    return (
      <EmptyState
        icon={Inbox}
        title="Finding not found"
        body="This result may have been removed or the link is stale."
        action={
          <Link
            href={`/audit-runs/${params.id}`}
            className="rounded-control bg-ink px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-black/90"
          >
            Back to dashboard
          </Link>
        }
      />
    );
  }

  const rawRequest = parseStructuredData<Record<string, unknown>>(result.rawRequest);
  const rawResponse = parseStructuredData<Record<string, unknown>>(result.rawResponse);
  const spans = parseStructuredData<Span[]>(result.evidenceSpans) ?? [];
  const evidenceExcerpt = spans[0]?.excerpt;
  const rounds =
    (rawRequest?.attackDefense as { rounds?: Round[] } | undefined)?.rounds ??
    (rawResponse?.attackDefense as { rounds?: Round[] } | undefined)?.rounds ??
    [];

  const responseText = result.normalizedResponse ?? result.responseText ?? "";
  const shortId = shortHash(result.id);
  const v = normalizeVerdict(result.verdict);

  const timelineSteps =
    rounds.length > 0
      ? rounds.map((r) => ({
          icon: r.defenseApplied ? Wrench : Send,
          title: `Round ${r.round} · ${
            r.mutationStrategy ? `mutation: ${r.mutationStrategy.replace(/_/g, " ")}` : "attack delivered"
          }`,
          body: r.responsePreview || r.attackPrompt || "—",
          verdict: r.verdict
        }))
      : [
          { icon: Send, title: "Attack delivered", body: result.testCase.prompt, verdict: undefined },
          { icon: MessageSquare, title: "Response captured", body: responseText.slice(0, 160), verdict: undefined },
          { icon: ScanSearch, title: "Evaluator verdict", body: result.explanation, verdict: result.verdict },
          { icon: Wrench, title: "Remediation proposed", body: result.remediation, verdict: undefined }
        ];

  return (
    <div className="space-y-6">
      <Link href={`/audit-runs/${result.auditRunId}`} className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
        <ChevronLeft size={16} /> Back to dashboard
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <VerdictBadge verdict={result.verdict} />
          <span className="font-mono text-xs text-ink-4">
            finding_{shortId} · {result.matchedRule ?? result.category}
          </span>
        </div>
        <h1 className="mt-3 text-[1.5625rem] font-[720] tracking-[-0.02em] text-ink">{result.testCase.name}</h1>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-line bg-surface p-5">
          <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Severity</p>
          <div className="mt-2">
            <SeverityPill severity={result.severity} />
          </div>
        </div>
        <MetricCard label="Confidence" value={result.confidence.toFixed(2)} />
        <MetricCard
          label="Score impact"
          value={`−${result.scoreImpact.toFixed(0)}`}
          valueClassName={impactColor(result.scoreImpact)}
        />
        <div className="rounded-card border border-line bg-surface p-5">
          <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Category</p>
          <p className="mt-2 text-sm font-medium text-ink">{result.category}</p>
        </div>
      </div>

      {/* Attack + expected */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Attack prompt</p>
          <p className="mt-3 whitespace-pre-wrap font-mono text-sm leading-6 text-ink-2">{result.testCase.prompt}</p>
        </Card>
        <Card>
          <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Expected behavior</p>
          <p className="mt-3 text-sm leading-6 text-ink-2">{result.testCase.expectedBehavior}</p>
        </Card>
      </div>

      {/* Actual response with evidence highlight */}
      <Card>
        <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Actual response</p>
        <p className="mt-3 font-mono text-sm leading-6 text-ink-2">
          <HighlightedResponse text={responseText} excerpt={evidenceExcerpt} />
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-3 pt-4">
          <span className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Matched rule</span>
          <span className={`rounded-md px-2 py-0.5 font-mono text-[0.6875rem] font-semibold ${verdictStyle[v].chip}`}>
            {result.matchedRule ?? "—"}
          </span>
        </div>
      </Card>

      {/* Explanation + evidence */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Explanation</p>
          <p className="mt-3 text-sm leading-6 text-ink-2">{result.explanation}</p>
        </Card>
        <Card>
          <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">Evidence</p>
          <p className="mt-3 text-sm leading-6 text-ink-2">{result.evidence}</p>
        </Card>
      </div>

      {/* Raw collapsibles */}
      <div className="grid gap-4 md:grid-cols-2">
        <RawCollapsible name="raw_request.json" value={rawRequest} />
        <RawCollapsible name="raw_response.json" value={rawResponse} />
      </div>

      {/* Remediation (dark) */}
      <div className="rounded-card bg-ink p-6">
        <div className="flex items-center gap-2">
          <Lightbulb size={17} className="text-onDark-accent" strokeWidth={2} />
          <p className="text-sm font-semibold text-white">Remediation</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-onDark">{result.remediation}</p>
        <p className="mt-3 font-mono text-xs text-onDark-pass">
          {result.category.toLowerCase().replace(/[^a-z0-9]+/g, "_")}
        </p>
      </div>

      {/* Attack–defense timeline */}
      <Card>
        <p className="text-sm font-semibold text-ink">Attack–defense loop</p>
        <ol className="mt-5 space-y-0">
          {timelineSteps.map((step, i) => (
            <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {i < timelineSteps.length - 1 && (
                <span className="absolute left-[15px] top-8 h-full w-px bg-line" aria-hidden />
              )}
              <span className="z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-canvas text-ink-3">
                <step.icon size={15} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">{step.title}</p>
                  {step.verdict && <VerdictBadge verdict={step.verdict} />}
                </div>
                <p className="mt-1 break-words text-sm leading-6 text-ink-3">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function RawCollapsible({ name, value }: { name: string; value: unknown }) {
  const json = JSON.stringify(value ?? null, null, 2);
  const size = new Blob([json]).size;
  return (
    <details className="group rounded-card border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5">
        <span className="font-mono text-xs text-ink-2">{name}</span>
        <span className="flex items-center gap-2 font-mono text-[0.6875rem] text-ink-4">
          {size} B
          <ChevronDown size={15} className="transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <pre className="overflow-x-auto border-t border-line-3 bg-canvas px-5 py-4 font-mono text-xs leading-5 text-ink-2">
        {json}
      </pre>
    </details>
  );
}
