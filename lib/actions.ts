"use server";

import { prisma } from "./prisma";
import { z } from "zod";
import { getDefaultSuite } from "./test-suite";
import { aggregateRun } from "@/lib/audit/aggregate";
import { runAttackDefenseLoop } from "@/lib/audit/attack-defense";
import { buildMarkdownReport } from "@/lib/audit/reporter";
import { EvaluationRecord } from "@/lib/audit/types";
import { getPipelineVersions, buildTargetSnapshot } from "@/lib/audit/versioning";
import { getDemoRun } from "@/lib/demo-data";
import { parseStructuredData, serializeStructuredData } from "@/lib/utils";

export async function createProject(formData: FormData) {
  const schema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    targetType: z.enum(["Prompt-only", "Endpoint", "RAG"])
  });
  const parsed = schema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    targetType: formData.get("targetType")
  });
  const project = await prisma.project.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      targetType: parsed.targetType
    }
  });
  await prisma.targetConfig.create({ data: { projectId: project.id } });
  return project;
}

export async function updateTargetConfig(projectId: string, formData: FormData) {
  const targetType = formData.get("targetType")?.toString() ?? "Prompt-only";
  const data: any = { };
  if (targetType === "Prompt-only") {
    data.systemPrompt = formData.get("systemPrompt")?.toString() ?? "";
    data.developerInstructions = formData.get("developerInstructions")?.toString() ?? "";
    data.exampleUserPrompt = formData.get("exampleUserPrompt")?.toString() ?? "";
  } else if (targetType === "Endpoint") {
    data.endpointUrl = formData.get("endpointUrl")?.toString() ?? "";
    data.httpMethod = formData.get("httpMethod")?.toString() ?? "POST";
    data.requestTemplate = formData.get("requestTemplate")?.toString() ?? "";
    const token = formData.get("authToken")?.toString();
    data.authTokenMasked = token ? maskToken(token) : undefined;
    data.messageFieldPath = formData.get("messageFieldPath")?.toString() ?? "";
  } else {
    data.ragQuery = formData.get("ragQuery")?.toString() ?? "";
    data.ragChunks = formData.get("ragChunks")?.toString() ?? "";
    data.ragResponse = formData.get("ragResponse")?.toString() ?? "";
  }

  await prisma.targetConfig.update({
    where: { projectId },
    data
  });
}

export async function runAudit(projectId: string, categories?: string[]) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { targetConfig: true } });
  if (!project) throw new Error("Project not found");
  const suite = await getDefaultSuite(categories);
  const targetSnapshot = buildTargetSnapshot(project.targetType, project.targetConfig);
  const pipelineVersions = getPipelineVersions();

  const auditRun = await prisma.auditRun.create({
    data: {
      projectId,
      status: "running",
      startedAt: new Date(),
      suiteVersion: pipelineVersions.suiteVersion,
      evaluatorVersion: pipelineVersions.evaluatorVersion,
      executionVersion: pipelineVersions.executionVersion,
      targetSnapshot: serializeStructuredData(targetSnapshot)
    }
  });

  const scores: number[] = [];
  for (const tc of suite) {
    const loopResult = await runAttackDefenseLoop({
      testCase: tc,
      targetSnapshot,
      ragChunks: project.targetConfig?.ragChunks ?? undefined
    });
    const execution = loopResult.finalExecution;
    const evaluated = loopResult.finalEvaluation;
    scores.push(evaluated.scoreImpact);

    const loopSummary = {
      stoppedReason: loopResult.stoppedReason,
      roundsExecuted: loopResult.rounds.length,
      rounds: loopResult.rounds
    };

    await prisma.testResult.create({
      data: {
        auditRunId: auditRun.id,
        testCaseId: tc.id,
        verdict: evaluated.verdict,
        confidence: evaluated.confidence,
        explanation: evaluated.explanation,
        evidence: evaluated.evidence,
        remediation: evaluated.remediation,
        responseText: execution.normalizedResponse,
        category: tc.category,
        severity: tc.severity,
        scoreImpact: evaluated.scoreImpact,
        rawRequest: serializeStructuredData({
          ...execution.rawRequest,
          attackDefense: loopSummary
        }),
        rawResponse: serializeStructuredData({
          ...execution.rawResponse,
          attackDefense: loopSummary
        }),
        normalizedResponse: execution.normalizedResponse,
        matchedRule: evaluated.matchedRule,
        evidenceSpans: serializeStructuredData(evaluated.evidenceSpans),
        remediationSuggestion: serializeStructuredData({
          ...evaluated.remediationSuggestion,
          attackDefense: loopSummary
        }),
        providerName: execution.executorKind,
        executionStatus: execution.status,
        latencyMs: execution.latencyMs,
        errorType: execution.errorType,
        errorMessage: execution.errorMessage
      }
    });
  }

  const { overallScore, riskTier } = aggregateRun(scores, suite.length);

  await prisma.auditRun.update({
    where: { id: auditRun.id },
    data: { status: "completed", completedAt: new Date(), overallScore, riskTier }
  });

  return { runId: auditRun.id };
}

export async function exportAuditJson(auditRunId: string) {
  let run = null;

  try {
    run = await prisma.auditRun.findUnique({
      where: { id: auditRunId },
      include: { project: true, results: { include: { testCase: true } } }
    });
  } catch (error) {
    if (auditRunId !== "demo-run") {
      throw error;
    }
  }

  if (!run && auditRunId === "demo-run") {
    return JSON.stringify(getDemoRun(), null, 2);
  }

  if (!run) {
    return null;
  }

  const hydratedRun = {
    ...run,
    targetSnapshot: parseStructuredData(run.targetSnapshot),
    results: run.results.map((result) => ({
      ...result,
      rawRequest: parseStructuredData(result.rawRequest),
      rawResponse: parseStructuredData(result.rawResponse),
      evidenceSpans: parseStructuredData(result.evidenceSpans),
      remediationSuggestion: parseStructuredData(result.remediationSuggestion)
    }))
  };

  return JSON.stringify(hydratedRun, null, 2);
}

export async function exportAuditCsv(auditRunId: string) {
  let results = null;

  try {
    results = await prisma.testResult.findMany({
      where: { auditRunId },
      include: { testCase: true }
    });
  } catch (error) {
    if (auditRunId !== "demo-run") {
      throw error;
    }
  }

  if ((!results || results.length === 0) && auditRunId === "demo-run") {
    results = getDemoRun().results;
  }

  if (!results || results.length === 0) {
    return null;
  }

  const headers = [
    "Test",
    "Category",
    "Severity",
    "Provider",
    "Execution Status",
    "Prompt",
    "Verdict",
    "Confidence",
    "Explanation",
    "Evidence",
    "Remediation"
  ];
  const rows = results.map((r) =>
    [
      r.testCase.name,
      r.category,
      r.severity,
      r.providerName ?? "-",
      r.executionStatus,
      r.testCase.prompt.replace(/\r?\n/g, " "),
      r.verdict,
      r.confidence.toFixed(2),
      r.explanation,
      r.evidence,
      r.remediation
    ]
      .map(escapeCsvField)
      .join(",")
  );
  return [headers.map(escapeCsvField).join(","), ...rows].join("\n");
}

export async function exportAuditMarkdown(auditRunId: string) {
  let run = null;

  try {
    run = await prisma.auditRun.findUnique({
      where: { id: auditRunId },
      include: { project: true, results: { include: { testCase: true } } }
    });
  } catch (error) {
    if (auditRunId !== "demo-run") {
      throw error;
    }
  }

  if (!run && auditRunId === "demo-run") {
    run = getDemoRun();
  }

  if (!run) {
    return null;
  }

  const evaluations: EvaluationRecord[] = run.results.map((r) => ({
    verdict: r.verdict as EvaluationRecord["verdict"],
    confidence: r.confidence,
    explanation: r.explanation,
    evidence: r.evidence,
    remediation: r.remediation,
    remediationSuggestion: parseStructuredData<Record<string, unknown>>(r.remediationSuggestion) ?? {},
    matchedRule: r.matchedRule ?? r.testCase.name,
    evidenceSpans: parseStructuredData<Array<{ label: string; excerpt: string }>>(r.evidenceSpans) ?? [],
    scoreImpact: r.scoreImpact
  }));

  return buildMarkdownReport(
    run.id,
    run.project.name,
    {
      overallScore: Math.round((run.overallScore ?? 0) * 10) / 10,
      riskTier: run.riskTier ?? "Unknown"
    },
    evaluations,
    {
      suiteVersion: run.suiteVersion ?? "unknown",
      evaluatorVersion: run.evaluatorVersion ?? "unknown",
      executionVersion: run.executionVersion ?? "unknown"
    }
  );
}

function escapeCsvField(value: unknown) {
  const text = String(value ?? "");
  const flattened = text.replace(/\r?\n/g, " ");
  return /[",]/.test(flattened) ? `"${flattened.replace(/"/g, '""')}"` : flattened;
}

function maskToken(token: string) {
  if (token.length <= 6) return "***";
  return `${token.slice(0, 3)}***${token.slice(-3)}`;
}
