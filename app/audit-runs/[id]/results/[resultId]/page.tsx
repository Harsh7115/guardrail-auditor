import { prisma } from "@/lib/prisma";
import { StatusPill } from "@/components/status-pill";
import Link from "next/link";

export default async function ResultDetailPage({ params }: { params: { id: string; resultId: string } }) {
  const result = await prisma.testResult.findUnique({
    where: { id: params.resultId },
    include: { testCase: true, auditRun: { include: { project: true } } }
  });
  if (!result) return <p className="text-slate-600">Result not found.</p>;

  return (
    <div className="space-y-6">
      <div className="card card-strong flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Test result</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{result.testCase.name}</h1>
          <p className="mt-3 text-sm text-slate-300">
            {result.category} · {result.severity} · {result.providerName ?? "simulated"}
          </p>
        </div>
        <StatusPill verdict={result.verdict as any} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-5">
          <p className="metric-kicker">Execution status</p>
          <p className="mt-3 text-2xl font-semibold text-white">{result.executionStatus}</p>
          <p className="mt-2 text-sm text-slate-400">Target-level status before scoring was applied.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Confidence</p>
          <p className="mt-3 text-2xl font-semibold text-white">{result.confidence.toFixed(2)}</p>
          <p className="mt-2 text-sm text-slate-400">Confidence reflects the deterministic heuristic scoring layer.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Latency</p>
          <p className="mt-3 text-2xl font-semibold text-white">{result.latencyMs != null ? `${result.latencyMs} ms` : "-"}</p>
          <p className="mt-2 text-sm text-slate-400">Measured at execution time for this test case.</p>
        </div>
        <div className="card p-5">
          <p className="metric-kicker">Matched rule</p>
          <p className="mt-3 text-xl font-semibold text-white">{result.matchedRule ?? "-"}</p>
          <p className="mt-2 text-sm text-slate-400">Stored with the result for future versioned comparisons.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <p className="section-title">Prompt</p>
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-7">{result.testCase.prompt}</p>
        </div>
        <div className="card p-5 space-y-3">
          <p className="section-title">Expected behavior</p>
          <p className="text-sm text-slate-300 leading-7">{result.testCase.expectedBehavior}</p>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <p className="section-title">Normalized response</p>
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-7">{result.normalizedResponse ?? result.responseText}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3">
          <p className="section-title">Explanation</p>
          <p className="text-sm text-slate-300 leading-7">{result.explanation}</p>
        </div>
        <div className="card p-5 space-y-3">
          <p className="section-title">Evidence</p>
          <p className="text-sm text-slate-300 leading-7">{result.evidence}</p>
        </div>
        <div className="card p-5 space-y-3">
          <p className="section-title">Remediation</p>
          <p className="text-sm text-slate-300 leading-7">{result.remediation}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <p className="section-title">Execution payloads</p>
          <div className="code-panel">
            {JSON.stringify(
              {
                rawRequest: result.rawRequest,
                rawResponse: result.rawResponse
              },
              null,
              2
            )}
          </div>
        </div>
        <div className="card p-5 space-y-3">
          <p className="section-title">Structured evidence</p>
          <div className="code-panel">
            {JSON.stringify(
              {
                evidenceSpans: result.evidenceSpans,
                remediationSuggestion: result.remediationSuggestion,
                errorType: result.errorType,
                errorMessage: result.errorMessage
              },
              null,
              2
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        <Link className="text-violet-300" href={`/audit-runs/${result.auditRunId}`}>
          Back to run
        </Link>
        <Link className="text-slate-400" href={`/projects/${result.auditRun.projectId}`}>
          Project overview
        </Link>
      </div>
    </div>
  );
}
