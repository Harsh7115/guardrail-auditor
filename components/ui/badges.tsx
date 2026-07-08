import { cn } from "@/lib/utils";
import {
  Verdict,
  Severity,
  Tier,
  verdictStyle,
  severityStyle,
  severityLabel,
  tierStyle,
  normalizeVerdict,
  normalizeSeverity,
  normalizeTier
} from "@/lib/verdict";

const chipBase = "inline-flex items-center gap-1.5 rounded-md font-mono text-[0.656rem] font-bold uppercase tracking-wide px-2.5 py-1";

// Verdict conveyed by TEXT label + color (never color alone).
export function VerdictBadge({ verdict, className }: { verdict: string; className?: string }) {
  const v: Verdict = normalizeVerdict(verdict);
  return (
    <span className={cn(chipBase, verdictStyle[v].chip, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", verdictStyle[v].dot)} aria-hidden />
      {verdictStyle[v].label}
    </span>
  );
}

export function SeverityPill({ severity, className }: { severity: string; className?: string }) {
  const s: Severity = normalizeSeverity(severity);
  return <span className={cn(chipBase, severityStyle[s], className)}>{severityLabel[s]}</span>;
}

export function RiskTierBadge({ tier, className }: { tier?: string | null; className?: string }) {
  const t: Tier = normalizeTier(tier);
  return (
    <span className={cn(chipBase, tierStyle[t], "px-3", className)}>
      RISK · {t.toUpperCase()}
    </span>
  );
}
