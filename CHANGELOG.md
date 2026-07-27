# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project has no
tagged releases yet; everything below ships on `main`.

## [Unreleased]

### Added
- Adversarial audit pipeline: an attack–defense loop (≤3 rounds) with a modular
  executor, scorer, aggregator, reporter, and pinned pipeline versioning.
- Prompt mutator with 9 adversarial strategies (jailbreak-prefix, role-switch,
  obfuscation, base64, boundary-escape, and more), wired into round-by-round
  attack escalation.
- Live OpenAI pipeline — a real model target plus LLM-as-judge scoring, opt-in
  via `OPENAI_API_KEY`. A $0 deterministic simulator is the default target.
- HTTP endpoint executor with a `{{prompt}}` request template.
- JSON / CSV / Markdown export route for CI gating on the safety score.
- Light editorial UI: dashboard shell, findings detail, score ring, charts.

### Security
- SSRF allowlist on the HTTP executor (blocks private, loopback, link-local, and
  cloud-metadata hosts).
- Per-process OpenAI spend circuit-breaker (`OPENAI_MAX_USD`).
- Security policy for private vulnerability disclosure (`SECURITY.md`).

### Fixed
- Graceful 404 instead of a 500 on unknown or unreadable ids.
- Hosted read-only demo is fully explorable with no navigation dead-ends.

### Documentation & tooling
- Architecture, scoring, test-category, and threat-model docs.
- MIT `LICENSE`, contributing guide, and README overhaul.
- Issue + pull-request templates.
- `.editorconfig` and `.gitattributes` for consistent formatting and line endings.

---

Dates and a first tagged release will be added once the project cuts one.
