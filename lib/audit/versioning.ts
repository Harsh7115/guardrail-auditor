import { TargetConfig } from "@prisma/client";
import { SuiteVersionRecord, TargetSnapshot } from "@/lib/audit/types";

export const AUDIT_PIPELINE_VERSIONS: SuiteVersionRecord = {
  suiteVersion: "default-suite@v1",
  evaluatorVersion: "heuristic-evaluator@v2",
  executionVersion: "modular-executor@v1"
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
