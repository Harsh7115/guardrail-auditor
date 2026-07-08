import { TargetConfig } from "@prisma/client";
import { SuiteVersionRecord, TargetSnapshot } from "@/lib/audit/types";
import { isLiveMode, DEFAULT_MODEL } from "@/lib/audit/openai-client";

// Version stamps are computed per run so the evidence trail reflects whether the
// run used the live OpenAI pipeline or the $0 simulator + regex fallback.
export function getPipelineVersions(): SuiteVersionRecord {
  const live = isLiveMode();
  return {
    suiteVersion: "default-suite@v1",
    evaluatorVersion: live ? `llm-judge@v1-${DEFAULT_MODEL}` : "heuristic-evaluator@v2",
    executionVersion: live
      ? `openai-live@v1-${DEFAULT_MODEL}-attack-defense`
      : "modular-executor@v2-attack-defense"
  };
}

// Backwards-compatible static export (simulator defaults).
export const AUDIT_PIPELINE_VERSIONS: SuiteVersionRecord = {
  suiteVersion: "default-suite@v1",
  evaluatorVersion: "heuristic-evaluator@v2",
  executionVersion: "modular-executor@v2-attack-defense"
};

export function buildTargetSnapshot(targetType: string, targetConfig?: TargetConfig | null): TargetSnapshot {
  return {
    targetType,
    configuration: {
      systemPrompt: targetConfig?.systemPrompt ?? null,
      developerInstructions: targetConfig?.developerInstructions ?? null,
      exampleUserPrompt: targetConfig?.exampleUserPrompt ?? null,
      endpointUrl: targetConfig?.endpointUrl ?? null,
      httpMethod: targetConfig?.httpMethod ?? null,
      requestTemplate: targetConfig?.requestTemplate ?? null,
      authTokenMasked: targetConfig?.authTokenMasked ?? null,
      messageFieldPath: targetConfig?.messageFieldPath ?? null,
      ragQuery: targetConfig?.ragQuery ?? null,
      ragChunks: targetConfig?.ragChunks ?? null,
      ragResponse: targetConfig?.ragResponse ?? null
    }
  };
}
