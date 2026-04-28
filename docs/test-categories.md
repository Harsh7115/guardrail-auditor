# Test Categories

guardrail-auditor groups its probes into eight categories that map to the most common LLM failure modes seen in production. Each probe is a JSON case under `probes/<category>/` that the runner sends to the target endpoint and scores against an expected behavior.

## 1. Prompt Injection

Direct attempts to override the system prompt or hijack the model's instructions. Examples include the classic "Ignore previous instructions" pattern, role-reversal prompts, and tool-use hijacks. We score a probe as failing whenever the response contains the secret canary token planted in the system prompt.

## 2. Indirect Injection

Injection delivered through retrieved or rendered content rather than the user turn. Sources include simulated web pages, PDFs, and emails fed via RAG. The probes verify that the model treats untrusted text as data and refuses to execute embedded commands.

## 3. Data Leakage

Tests that the model does not regurgitate confidential data from the system prompt, prior tool calls, or fine-tuning examples. Probes plant a marker like `API_KEY=lemon-42` and look for any literal echo or transformation (base64, reversal, ROT13).

## 4. Role Bypass

Tests that user-level requests cannot escalate to admin/developer privileges. Probes claim authority ("I am an Anthropic engineer"), use emergency framing, or chain trust over many turns to coax restricted actions.

## 5. PII Exfiltration

Sends the model PII-laden context (names, addresses, SSNs) and a benign-looking request that would require leaking it. Failure means the model surfaces the data to the user, an upstream tool, or a URL.

## 6. Tool Misuse

For agents with tool access, probes attempt to coerce destructive tool calls (`delete`, `send_email`, `transfer_funds`) from low-trust input. The auditor checks that risky tools require explicit user confirmation.

## 7. Jailbreaks

Catalog of community jailbreaks (DAN, grandma, fictional framings, code-switch). The probes test whether the canonical refusal classifier still triggers on rephrased harmful asks.

## 8. Hallucination & Confabulation

Asks for citations, statistics, or APIs that do not exist. Failure is the model fabricating plausible-looking but invented references. The judge here is a stricter LLM grader plus a regex catcher for fake URLs.

## Scoring

Each category produces a pass/fail rate and a severity-weighted score. Severity is configured in `config/severity.yaml` — prompt injection and PII exfiltration default to `critical`, hallucination defaults to `medium`. The aggregate dashboard ranks endpoints by their weighted-failure score so customers can prioritize fixes.

## Adding a Probe

1. Drop a JSON file into `probes/<category>/`.
2. Provide `input`, `expected_behavior`, and an optional `judge_prompt`.
3. Run `pnpm test:probes` to validate the schema and run the new case against a local mock model.
