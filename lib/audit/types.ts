import { TestCase } from "@prisma/client";
import { Verdict } from "@/lib/utils";

export type TargetSnapshot = {
  targetType: string;
  configuration: Record<string, string | null>;
};

export type ExecutorKind = "simulated" | "generic-http" | "openai" | "anthropic";

export type ExecutionRecord = {
  executorKind: ExecutorKind;
  rawRequest: Record<string, unknown>;
  rawResponse: Record<string, unknown>;
  normalizedResponse: string;
  latencyMs: number;
  status: "completed" | "failed";
  errorType?: string;
  errorMessage?: string;
};

export type EvaluationRecord = {
  verdict: Verdict;
  confidence: number;
  explanation: string;
  evidence: string;
  remediation: string;
  remediationSuggestion: Record<string, unknown>;
  matchedRule: string;
  evidenceSpans: Array<{ label: string; excerpt: string }>;
  scoreImpact: number;
};

export type AggregatedRun = {
  overallScore: number;
  riskTier: string;
};

export type SuiteVersionRecord = {
  suiteVersion: string;
  evaluatorVersion: string;
  executionVersion: string;
};

export type AuditPipelineContext = {
  testCase: TestCase;
  targetSnapshot: TargetSnapshot;
  ragChunks?: string;
};
