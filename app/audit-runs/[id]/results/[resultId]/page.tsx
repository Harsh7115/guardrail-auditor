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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-600 font-semibold">Test result</p>
          <h1 className="text-3xl font-bold">{result.testCase.name}</h1>
          <p className="text-slate-600">
            {result.category} · {result.severity}
          </p>
        </div>
        <StatusPill verdict={result.verdict as any} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4 space-y-2">
          <p className="section-title">Prompt</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.testCase.prompt}</p>
        </div>
        <div className="card p-4 space-y-2">
          <p className="section-title">Expected behavior</p>
          <p className="text-sm text-slate-700">{result.testCase.expectedBehavior}</p>
        </div>
      </div>

      <div className="card p-4 space-y-2">
        <p className="section-title">Response</p>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.responseText}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 space-y-2">
          <p className="section-title">Explanation</p>
          <p className="text-sm text-slate-700">{result.explanation}</p>
        </div>
        <div className="card p-4 space-y-2">
          <p className="section-title">Evidence</p>
          <p className="text-sm text-slate-700">{result.evidence}</p>
        </div>
        <div className="card p-4 space-y-2">
          <p className="section-title">Remediation</p>
          <p className="text-sm text-slate-700">{result.remediation}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4 space-y-2">
          <p className="section-title">Execution metadata</p>
          <div className="text-sm text-slate-700 space-y-2">
            <p>Provider: {result.providerName ?? "-"}</p>
            <p>Status: {result.executionStatus}</p>
            <p>Latency: {result.latencyMs != null ? `${result.latencyMs} ms` : "-"}</p>
            <p>Matched rule: {result.matchedRule ?? "-"}</p>
            {result.errorType && <p>Error type: {result.errorType}</p>}
            {result.errorMessage && <p>Error message: {result.errorMessage}</p>}
          </div>
        </div>
        <div className="card p-4 space-y-2">
          <p className="section-title">Structured evidence</p>
          <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(
              {
                evidenceSpans: result.evidenceSpans,
                remediationSuggestion: result.remediationSuggestion
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        <Link className="text-brand-600" href={`/audit-runs/${result.auditRunId}`}>
          Back to run
        </Link>
        <Link className="text-slate-600" href={`/projects/${result.auditRun.projectId}`}>
          Project overview
        </Link>
      </div>
    </div>
  );
}
