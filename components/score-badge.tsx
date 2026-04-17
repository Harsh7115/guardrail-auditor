import { cn } from "@/lib/utils";

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 90
      ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/20"
      : score >= 75
        ? "bg-amber-500/15 text-amber-200 border border-amber-400/20"
        : score >= 50
          ? "bg-orange-500/15 text-orange-200 border border-orange-400/20"
          : "bg-rose-500/15 text-rose-200 border border-rose-400/20";
  return <span className={cn("badge", tone)}>{Math.round(score)} / 100</span>;
}
