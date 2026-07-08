import OpenAI from "openai";

/**
 * openai-client.ts
 *
 * Thin server-only wrapper around the OpenAI SDK. Keeps a single lazily-created
 * client, caps output tokens, and logs token usage + an estimated running cost
 * so the pipeline stays cheap and observable ($7-budget friendly).
 *
 * The whole live pipeline is OPT-IN: if OPENAI_API_KEY is unset, isLiveMode()
 * returns false and callers fall back to the $0 deterministic simulator / regex.
 */

export const DEFAULT_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

// Hard spend circuit-breaker. Once cumulative spend in this process reaches the
// cap, further live calls throw (callers degrade gracefully to a failed record /
// simulator). Bounds the financial blast radius of an unauthenticated public
// deploy that has a key set. Configurable via OPENAI_MAX_USD.
const MAX_SESSION_USD = (() => {
  const parsed = Number(process.env.OPENAI_MAX_USD);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1.0;
})();

// Per-1M-token USD rates. gpt-4o-mini is the default; others are best-effort
// estimates used only for the local cost log (not billing-accurate).
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1": { input: 2.0, output: 8 }
};

let client: OpenAI | null = null;
let runningCostUsd = 0;

export function isLiveMode(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const rate = PRICING[model] ?? PRICING["gpt-4o-mini"];
  return (promptTokens * rate.input + completionTokens * rate.output) / 1_000_000;
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatResult = {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
};

/**
 * Single chat completion with usage logging. `label` tags the log line so you
 * can tell target calls from judge calls while watching spend.
 */
export async function chatComplete(
  messages: ChatMessage[],
  opts: { label: string; maxTokens?: number; jsonMode?: boolean; temperature?: number } = { label: "call" }
): Promise<ChatResult> {
  if (runningCostUsd >= MAX_SESSION_USD) {
    throw new Error(
      `OpenAI spend cap reached ($${MAX_SESSION_USD.toFixed(2)}). Raise OPENAI_MAX_USD to continue.`
    );
  }

  const model = DEFAULT_MODEL;
  const completion = await getClient().chat.completions.create({
    model,
    messages,
    max_tokens: opts.maxTokens ?? 300,
    temperature: opts.temperature ?? 0.2,
    ...(opts.jsonMode ? { response_format: { type: "json_object" as const } } : {})
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const promptTokens = completion.usage?.prompt_tokens ?? 0;
  const completionTokens = completion.usage?.completion_tokens ?? 0;
  const costUsd = estimateCost(model, promptTokens, completionTokens);
  runningCostUsd += costUsd;

  // eslint-disable-next-line no-console
  console.log(
    `[openai:${opts.label}] ${model} in=${promptTokens} out=${completionTokens} ` +
      `cost=$${costUsd.toFixed(5)} running=$${runningCostUsd.toFixed(4)}`
  );

  return { text, model, promptTokens, completionTokens, costUsd };
}

export function getRunningCostUsd(): number {
  return runningCostUsd;
}
