// Quick OpenAI connectivity + cost check. Run: node scripts/smoke-openai.mjs
// Reads OPENAI_API_KEY / OPENAI_MODEL from .env.local. Makes ONE tiny call.
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

// Minimal .env.local loader (no dependency).
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}

const key = process.env.OPENAI_API_KEY?.trim();
if (!key) {
  console.error("❌ OPENAI_API_KEY is empty. Paste your key into .env.local and re-run.");
  process.exit(1);
}

const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
const client = new OpenAI({ apiKey: key });

const r = await client.chat.completions.create({
  model,
  max_tokens: 20,
  messages: [{ role: "user", content: "Reply with exactly: guardrail auditor live" }]
});

const usage = r.usage ?? {};
const cost = ((usage.prompt_tokens ?? 0) * 0.15 + (usage.completion_tokens ?? 0) * 0.6) / 1_000_000;
console.log("✅ OpenAI reachable");
console.log("   model :", model);
console.log("   reply :", r.choices[0]?.message?.content?.trim());
console.log(`   tokens: in=${usage.prompt_tokens} out=${usage.completion_tokens}  ~$${cost.toFixed(6)}`);
