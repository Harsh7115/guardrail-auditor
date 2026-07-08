# Guardrail Auditor — Roadmap & Future Improvements

Solo project. This is the running backlog of directions worth exploring, grouped by
theme. Each item notes rough effort (S/M/L) and whether it's **credibility** (makes
the tool real), **polish**, or a **differentiator**.

The through-line: the software architecture already reads as strong. The leverage is
in **security credibility** — making the attacks and evaluation real (or honestly
framed) and mapping everything to recognized standards.

---

## 1. Security-testing rigor (the credibility core)

- **Map every category to OWASP LLM Top 10 + MITRE ATLAS + NIST AI RMF.** Tag each
  test case and finding with the standard's IDs. Cheapest credibility multiplier. _(S, credibility)_
- **Replace the 30 static one-liners with a real technique taxonomy** — encoding
  smuggling (base64/rot13/leetspeak), multi-turn crescendo, roleplay/persona hijack,
  payload splitting, Unicode homoglyph / zero-width, translation pivots, tool/function
  -call abuse, system-prompt-extraction ladders. _(M, credibility + differentiator)_
- **Ingest a public red-team dataset** (AdvBench / HarmBench / JailbreakBench / garak
  probes) as an importable suite, so methodology is defensible. _(M, credibility)_
- **Make the adaptive attacker actually adaptive** (PAIR/TAP-style): the attacker LLM
  reads the last refusal and mutates its next attempt. Today `escalateAttackPrompt()`
  rotates 3 fixed prefixes and ignores the model's response. _(M-L, differentiator)_
- **Reframe the defense loop as a "hypothetical hardening preview,"** or make the patch
  an exportable system-prompt diff the user can copy. Don't imply it's a real fix. _(S, credibility)_
- **Split vulnerability score (round 1) from remediability (the delta).** The current
  score uses the post-defense verdict, which conflates the two. _(S, credibility)_

## 2. Evaluator quality (can you trust the verdict?)

- **Stop grading gpt-4o-mini with gpt-4o-mini** — use a different judge model family,
  or at least make the judge model independently configurable. _(S, credibility)_
- **Validate the judge against a ~40-item human-labeled gold set** and show agreement
  (accuracy / Cohen's κ) in the UI. "Agrees with humans 88%, κ=0.7" is a strong line. _(M, differentiator)_
- **Fix the RAG-grounding check** — `detectUnsupportedClaims()` is a naive substring
  match (near-random). Use NLI/entailment or embedding similarity, or defer to the LLM
  judge for RAG. _(M, credibility)_
- **Dual-judge with disagreement flagging** → surface "needs human review" instead of
  silently picking one. _(M, polish → credibility)_

## 3. Provider & integration breadth

- **Ship the Anthropic executor** (currently a stub) → enables cross-provider
  "Claude vs GPT on the same suite" comparison audits. _(S-M, credibility + differentiator)_
- **Add a local/OSS path (Ollama)** for unlimited free live demos. _(S, polish)_
- **Harden the generic-HTTP executor into a real adapter** — honor `messageFieldPath`
  JSON extraction (schema has the field, executor ignores it), auth header injection,
  streaming/SSE. Makes "point it at any chatbot" real. _(M, credibility)_

## 4. CI/CD & regression story (the standout differentiator)

- **`guardrail-audit` CLI + GitHub Action** that fails a PR on security regression and
  comments the score delta. Reframes the project from "dashboard" to "the thing that
  stops your prompt change from silently breaking your jailbreak defenses." _(M-L, differentiator)_
- **Run-to-run diff view.** The `suiteVersion / evaluatorVersion / executionVersion`
  stamps already exist but nothing consumes them; show which cases flipped pass↔fail. _(M, credibility)_
- **Score trend over time** (per-project sparkline). _(S, polish)_

## 5. Data, persistence & multi-tenancy

- **Persist per-run cost + a hard budget kill-switch.** (A per-process spend
  circuit-breaker now exists in `openai-client.ts`; make it per-run and persisted.) _(S-M, credibility)_
- **Move the hosted demo off SQLite to Postgres (Neon/Supabase).** SQLite is ephemeral
  and read-only on Vercel, so the live deploy can only ever show `demo-run` and the
  create/run flows fail. _(S, credibility)_
- **Auth + per-user projects** (NextAuth). Only if productizing — otherwise skip. _(M, polish)_

## 6. UX, reporting & shareability

- **One-click PDF / shareable read-only report URL.** Highest portfolio-impact-per-hour;
  the artifact becomes shareable outside the running app. _(S-M, portfolio impact)_
- **Evidence-first finding cards with the full attack transcript** (data is already in
  `rawRequest.attackDefense.rounds`). Watching the model get jailbroken round by round
  is the most demo-able moment in the app. _(S, portfolio impact)_
- **LLM-written executive summary** (3 sentences) at the top of a report. _(S, polish)_

## 7. Trust, safety & positioning

- **A "methodology & limitations" page** — what the suite covers, what it doesn't, judge
  error rate, why simulated mode exists. Knowing your tool's limits is the senior move. _(S, credibility)_
- **Position explicitly vs garak / PyRIT / Giskard / Promptfoo** — yours: full-stack web
  UI + CI gate + regression tracking; theirs: CLI libraries. _(S, portfolio impact)_

---

## Recommended next order (credibility first, then the one big bet)

1. Standards mapping (1.1) — quick win, biggest credibility jump.
2. Methodology page + honest defense-loop reframing (7.1 + 1.5) — turns weak spots into maturity.
3. Modern attack suite + technique tags (1.2).
4. Different judge model + gold-set validation (2.1 + 2.2) — answers "how do you know the verdicts are right?"
5. CI regression gate + run-diff view (4.1 + 4.2) — the bet that changes what the project *is*.
6. Persist cost + Postgres for the hosted demo (5.1 + 5.2) — defensive.
7. Shareable PDF/URL report + inline attack transcripts (6.1 + 6.2).

**Deliberately skipped for now:** auth/multi-tenancy (undifferentiated plumbing);
making the append-to-prompt "auto-patch" smarter (architectural dead end — invest in
the adaptive *attacker* instead); more chart eye-candy.

---

## Security notes (hardening already applied)

- **SSRF guard** on the generic-HTTP executor: blocks non-http(s) schemes and private /
  loopback / link-local / cloud-metadata hosts (`lib/audit/executor.ts`).
- **OpenAI spend circuit-breaker**: per-process cap via `OPENAI_MAX_USD` (default $1)
  bounds financial blast radius (`lib/audit/openai-client.ts`).
- **Deploy rule:** do NOT set `OPENAI_API_KEY` in the public Vercel environment — keep
  the public deploy on the $0 simulator. Live audits are for local use only until auth
  + rate limiting exist.
- Still open (accepted for a portfolio demo, revisit if productizing): no auth, no rate
  limiting. Track under §5.3.
