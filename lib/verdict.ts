// Single source of truth for verdict / severity / risk-tier presentation.
// Keyed on the REAL data values the pipeline emits (not the design mock's
// shorthand): verdict is "warning" (not "warn"); tier is "Low|Moderate|High|
// Critical" (not A/B/C/D); severity is "low|medium|high".

export type Verdict = "pass" | "warning" | "fail";
export type Severity = "low" | "medium" | "high";
export type Tier = "Low" | "Moderate" | "High" | "Critical";

export const verdictStyle: Record<Verdict, { chip: string; bar: string; dot: string; label: string }> = {
  pass: { chip: "bg-pass-soft text-pass", bar: "bg-pass-chart", dot: "bg-pass-chart", label: "PASS" },
  warning: { chip: "bg-warn-soft text-warn", bar: "bg-warn-chart", dot: "bg-warn-chart", label: "WARN" },
  fail: { chip: "bg-fail-soft text-fail", bar: "bg-fail-chart", dot: "bg-fail-chart", label: "FAIL" }
};

// Chart hex values (Recharts needs raw colors, not classes).
export const verdictChartColor: Record<Verdict, string> = {
  pass: "#4FB477",
  warning: "#E7B34A",
  fail: "#E6534B"
};

export const severityStyle: Record<Severity, string> = {
  low: "bg-pass-soft text-pass",
  medium: "bg-warn-soft text-warn",
  high: "bg-fail-soft text-fail"
};

export const severityLabel: Record<Severity, string> = {
  low: "LOW",
  medium: "MED",
  high: "HIGH"
};

// Real risk tiers from lib/audit/aggregate.ts: Low ≥90, Moderate ≥75, High ≥50, else Critical.
// Each tier has a distinct hue: green → amber → orange → red.
export const tierStyle: Record<Tier, string> = {
  Low: "bg-pass-soft text-pass",
  Moderate: "bg-warn-soft text-warn",
  High: "bg-high-soft text-high",
  Critical: "bg-fail-soft text-fail"
};

// Score-impact color (higher impact = worse) for the findings table.
export const impactColor = (impact: number) =>
  impact >= 12 ? "text-fail" : impact >= 6 ? "text-warn" : "text-ink-3";

// pass-rate → bar color (category breakdown)
export const rateColor = (pct: number) =>
  pct >= 85 ? "bg-pass-chart" : pct >= 70 ? "bg-warn-chart" : "bg-fail-chart";

export function normalizeVerdict(v: string): Verdict {
  return v === "pass" || v === "warning" || v === "fail" ? v : "warning";
}

export function normalizeSeverity(s: string): Severity {
  return s === "low" || s === "medium" || s === "high" ? s : "medium";
}

export function normalizeTier(t?: string | null): Tier {
  return t === "Low" || t === "Moderate" || t === "High" || t === "Critical" ? t : "Critical";
}
