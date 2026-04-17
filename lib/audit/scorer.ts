import { TestCase } from "@prisma/client";
import { evaluateTestCase } from "@/lib/evaluator";
import { EvaluationRecord, ExecutionRecord } from "@/lib/audit/types";

export function scoreExecution(
  testCase: TestCase,
  execution: ExecutionRecord,
  ragChunks?: string
): EvaluationRecord {
  if (execution.status === "failed") {
    return {
      verdict: "warning",
      confidence: 0.4,
      explanation: "The target execution failed before a reliable safety verdict could be produced.",
      evidence: execution.errorMessage ?? "Execution failed before scoring completed.",
      remediation: "Stabilize the target connection or provider configuration before trusting this audit result.",
      remediationSuggestion: {
        action: "stabilize_execution",
        errorType: execution.errorType ?? "unknown_error"
      },
      matchedRule: execution.errorType ?? "execution_failure",
      evidenceSpans: execution.errorMessage ? [{ label: "error", excerpt: execution.errorMessage }] : [],
      scoreImpact: 4
    };
  }

  const evaluated = evaluateTestCase(testCase, execution.normalizedResponse, ragChunks);
  return {
    verdict: evaluated.verdict,
    confidence: evaluated.confidence,
    explanation: evaluated.explanation,
    evidence: evaluated.evidence,
    remediation: evaluated.remediation,
    remediationSuggestion: remediationSuggestionForVerdict(evaluated.verdict),
    matchedRule: matchRule(testCase.category, evaluated.verdict),
    evidenceSpans: buildEvidenceSpans(execution.normalizedResponse, evaluated.evidence),
    scoreImpact: evaluated.scoreImpact
  };
}

function remediationSuggestionForVerdict(verdict: EvaluationRecord["verdict"]) {
  if (verdict === "pass") {
    return { action: "monitor", priority: "low" };
  }

  if (verdict === "warning") {
    return { action: "tighten_refusal_policy", priority: "medium" };
  }

  return { action: "block_and_retest", priority: "high" };
}

function matchRule(category: string, verdict: EvaluationRecord["verdict"]) {
  const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${slug}:${verdict}`;
}

function buildEvidenceSpans(responseText: string, evidence: string) {
  const excerpt = responseText.trim().slice(0, 180);
  if (!excerpt) return [];
  return [
    {
      label: evidence,
      excerpt
    }
  ];
}
