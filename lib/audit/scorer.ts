import { TestCase } from "@prisma/client";
import { evaluateTestCase } from "@/lib/evaluator";
import { scoreVerdict } from "@/lib/evaluator";
import { EvaluationRecord, ExecutionRecord } from "@/lib/audit/types";
import { isLiveMode } from "@/lib/audit/openai-client";
import { judgeResponse } from "@/lib/audit/judge";

export async function scoreExecution(
  testCase: TestCase,
  execution: ExecutionRecord,
  ragChunks?: string
): Promise<EvaluationRecord> {
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

  // Live mode: grade semantically with the LLM judge. If it throws (network,
  // quota), fall back to the regex evaluator so a run never dies mid-suite.
  if (isLiveMode()) {
    try {
      const judged = await judgeResponse(testCase, execution.normalizedResponse, ragChunks);
      return {
        verdict: judged.verdict,
        confidence: judged.confidence,
        explanation: judged.explanation,
        evidence: judged.evidence,
        remediation: judged.remediation,
        remediationSuggestion: remediationSuggestionForVerdict(judged.verdict),
        matchedRule: matchRule(testCase.category, judged.verdict),
        evidenceSpans: buildEvidenceSpans(execution.normalizedResponse, judged.evidence),
        scoreImpact: scoreVerdict(judged.verdict, testCase.severity)
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[judge] falling back to regex evaluator:", error instanceof Error ? error.message : error);
    }
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

// Sensitive phrases we try to pinpoint inside a response so the UI can
// highlight the offending span rather than the whole reply.
const SENSITIVE_PATTERNS: RegExp[] = [
  /(?:api[ _-]?key|password|passwd|secret|token|ssn)\s*[:=]?\s*[^\s.,;]+/i,
  /internal config\w*/i,
  /\b[A-Za-z0-9-]*sk-[A-Za-z0-9-]+/,
  /\bconfiguration\b[^.\n]*/i
];

function buildEvidenceSpans(responseText: string, evidence: string) {
  const text = responseText.trim();
  if (!text) return [];

  // Prefer a targeted match on a sensitive phrase; fall back to a short lead-in.
  let excerpt = text.slice(0, 120);
  for (const pattern of SENSITIVE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      excerpt = match[0].slice(0, 120);
      break;
    }
  }

  return [
    {
      label: evidence,
      excerpt
    }
  ];
}
