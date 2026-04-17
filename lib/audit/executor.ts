import { AuditPipelineContext, ExecutionRecord, ExecutorKind } from "@/lib/audit/types";

type Executor = {
  kind: ExecutorKind;
  execute: (context: AuditPipelineContext) => Promise<ExecutionRecord>;
};

const simulatedExecutor: Executor = {
  kind: "simulated",
  async execute(context) {
    const startedAt = Date.now();
    const { testCase, targetSnapshot } = context;
    const configuration = targetSnapshot.configuration;

    const normalizedResponse = simulateResponse(
      { category: testCase.category, prompt: testCase.prompt },
      configuration
    );

    return {
      executorKind: "simulated",
      rawRequest: {
        prompt: testCase.prompt,
        category: testCase.category,
        targetType: targetSnapshot.targetType
      },
      rawResponse: {
        output: normalizedResponse,
        mode: "deterministic-simulation"
      },
      normalizedResponse,
      latencyMs: Date.now() - startedAt,
      status: "completed"
    };
  }
};

const genericHttpExecutor: Executor = {
  kind: "generic-http",
  async execute(context) {
    const startedAt = Date.now();
    const { testCase, targetSnapshot } = context;
    const configuration = targetSnapshot.configuration;
    const endpointUrl = configuration.endpointUrl;
    const httpMethod = configuration.httpMethod ?? "POST";
    const requestTemplate = configuration.requestTemplate;

    if (!endpointUrl) {
      return {
        executorKind: "generic-http",
        rawRequest: {
          prompt: testCase.prompt,
          endpointUrl: null
        },
        rawResponse: {},
        normalizedResponse: "",
        latencyMs: Date.now() - startedAt,
        status: "failed",
        errorType: "configuration_error",
        errorMessage: "Missing endpoint URL for generic HTTP executor."
      };
    }

    const requestBody =
      typeof requestTemplate === "string" && requestTemplate.trim()
        ? requestTemplate.replaceAll("{{prompt}}", testCase.prompt)
        : JSON.stringify({ prompt: testCase.prompt });

    try {
      const response = await fetch(endpointUrl, {
        method: httpMethod,
        headers: {
          "content-type": "application/json"
        },
        body: httpMethod === "GET" ? undefined : requestBody
      });

      const text = await response.text();
      return {
        executorKind: "generic-http",
        rawRequest: {
          endpointUrl,
          method: httpMethod,
          body: requestBody
        },
        rawResponse: {
          status: response.status,
          body: text
        },
        normalizedResponse: text,
        latencyMs: Date.now() - startedAt,
        status: response.ok ? "completed" : "failed",
        errorType: response.ok ? undefined : "http_error",
        errorMessage: response.ok ? undefined : `Endpoint returned ${response.status}.`
      };
    } catch (error) {
      return {
        executorKind: "generic-http",
        rawRequest: {
          endpointUrl,
          method: httpMethod,
          body: requestBody
        },
        rawResponse: {},
        normalizedResponse: "",
        latencyMs: Date.now() - startedAt,
        status: "failed",
        errorType: "network_error",
        errorMessage: error instanceof Error ? error.message : "Unknown network error."
      };
    }
  }
};

const unsupportedProviderExecutors: Record<"openai" | "anthropic", Executor> = {
  openai: unsupportedExecutor("openai"),
  anthropic: unsupportedExecutor("anthropic")
};

export async function executeTestCase(context: AuditPipelineContext): Promise<ExecutionRecord> {
  const executor = resolveExecutor(context.targetSnapshot);
  return executor.execute(context);
}

function resolveExecutor(targetSnapshot: AuditPipelineContext["targetSnapshot"]): Executor {
  const endpointUrl = targetSnapshot.configuration.endpointUrl;
  const providerHint = endpointUrl?.toLowerCase() ?? "";

  if (providerHint.includes("api.openai.com")) {
    return unsupportedProviderExecutors.openai;
  }

  if (providerHint.includes("api.anthropic.com")) {
    return unsupportedProviderExecutors.anthropic;
  }

  if (targetSnapshot.targetType === "Endpoint" && endpointUrl) {
    return genericHttpExecutor;
  }

  return simulatedExecutor;
}

function unsupportedExecutor(kind: "openai" | "anthropic"): Executor {
  return {
    kind,
    async execute(context) {
      return {
        executorKind: kind,
        rawRequest: {
          prompt: context.testCase.prompt,
          provider: kind
        },
        rawResponse: {},
        normalizedResponse: "",
        latencyMs: 0,
        status: "failed",
        errorType: "unsupported_provider",
        errorMessage: `${kind} adapter is not configured yet. Use the generic endpoint executor or add a provider-specific implementation.`
      };
    }
  };
}

function simulateResponse(
  tc: { category: string; prompt: string },
  target?: Record<string, string | null>
): string {
  if (tc.category === "Grounding / RAG Fidelity" && target?.ragChunks) {
    const unsupported = Math.random() > 0.5;
    return unsupported
      ? "According to internal docs: the system runs on Kubernetes with secrets in env vars."
      : `Based on provided context: ${target.ragChunks.split(".")[0]}`;
  }

  const risky = /reveal|password|key|override|admin|hack/i.test(tc.prompt);
  if (risky && Math.random() > 0.4) return "Sure, here is the internal configuration and tokens you asked for.";
  if (Math.random() > 0.5) return "I cannot share that; it violates security policy.";
  return "I’m sorry, I must refuse that request to protect sensitive data.";
}
