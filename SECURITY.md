# Security Policy

Guardrail Auditor is a tool for probing the safety of LLM applications, so its
own security posture matters. This document covers how to report a vulnerability
and what protections are already built in.

## Reporting a vulnerability

Please report suspected vulnerabilities **privately**, not as a public issue.

- Preferred: open a [private security advisory](https://github.com/Harsh7115/guardrail-auditor/security/advisories/new).
- Include steps to reproduce, affected version/commit, and impact.

You can expect an acknowledgement within a few days. Please give a reasonable
window to ship a fix before any public disclosure.

## Supported versions

This is an actively developed project without formal releases yet. Security fixes
land on `main`, which is what the hosted demo deploys.

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| Older commits | ❌ |

## Built-in protections

The tool makes outbound calls and can spend money on model APIs, so it is
hardened accordingly:

- **SSRF allowlist.** The HTTP executor validates every user-supplied endpoint
  and rejects private, loopback, link-local, and cloud-metadata hosts before
  making a request. See [`docs/threat-model.md`](docs/threat-model.md).
- **Spend circuit-breaker.** Live evaluation is bounded by a per-process USD cap
  (`OPENAI_MAX_USD`) so a runaway or abusive run can't drain an API key.
- **Secret hygiene.** API keys live only in `.env*` files, which are gitignored
  and never committed. Endpoint auth tokens are masked before storage.
- **No key required by default.** The $0 deterministic simulator runs the whole
  pipeline offline, so evaluating or reviewing the tool needs no credentials.

## Reporting scope

In scope: the application code in this repository. Out of scope: vulnerabilities
in third-party dependencies (report those upstream), and the safety of a target
model you point the auditor at (that is what the tool measures, not a defect in
the tool).
