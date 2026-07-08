import { rateColor } from "@/lib/verdict";
import { cn } from "@/lib/utils";

// Horizontal pass-rate bar (styled div — lighter than a chart lib, matches the
// prototype). `pct` is 0–100.
export function CategoryBar({ label, pct, meta }: { label: string; pct: number; meta?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink-2">{label}</span>
        <span className="font-mono text-xs text-ink-4">
          {meta ? `${meta} · ` : ""}
          {clamped}%
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line-3">
        <div
          className={cn("h-full origin-left rounded-full", rateColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
