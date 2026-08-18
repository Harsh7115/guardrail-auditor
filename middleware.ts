import { NextResponse } from "next/server";

// ─── TEMPORARY MAINTENANCE MODE ─────────────────────────────────────────────
// Every route serves a static 503 "temporarily offline" page so the site reads
// as intentionally down rather than broken. Self-contained HTML (inline CSS),
// so it needs no assets.
//
// TO BRING THE SITE BACK UP: delete this file and redeploy (push to main).
// Scheduled restore: Wed 2026-08-19 5pm MST.
// ────────────────────────────────────────────────────────────────────────────

const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Guardrail Auditor — temporarily offline</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    font-family: ui-sans-serif, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #FBFAF8; color: #0C0D10; padding: 24px;
  }
  main { max-width: 460px; text-align: center; }
  .badge {
    display: inline-block; font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 12px; letter-spacing: .06em; text-transform: uppercase;
    color: #4B49E6; background: rgba(75,73,230,.10);
    padding: 4px 10px; border-radius: 999px; margin-bottom: 20px;
  }
  h1 { font-size: 1.6rem; letter-spacing: -.02em; margin: 0 0 12px; }
  p { font-size: 1rem; line-height: 1.6; color: #4a4d57; margin: 0; }
  @media (prefers-color-scheme: dark) {
    body { background: #0C0D10; color: #F3F3F1; }
    p { color: #a9acb6; }
    .badge { color: #9d9bff; background: rgba(120,118,255,.15); }
  }
</style>
</head>
<body>
  <main>
    <span class="badge">Maintenance</span>
    <h1>Guardrail Auditor is temporarily offline</h1>
    <p>The site is down for brief scheduled maintenance and will be back shortly. Thanks for your patience.</p>
  </main>
</body>
</html>`;

export function middleware() {
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": "86400",
      "cache-control": "no-store, no-cache, must-revalidate"
    }
  });
}

// Match every route so the whole site (pages + API) returns the maintenance page.
export const config = {
  matcher: "/:path*"
};
