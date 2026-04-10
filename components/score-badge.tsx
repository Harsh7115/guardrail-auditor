import { cn } from "@/lib/utils";

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 90 ? "bg-emerald-100 text-emerald-800" : score >= 75 ? "bg-amber-100 text-amber-800" : score >= 50 ? "bg-orange-100 text-orange-800" : "bg-rose-100 text-rose-800";
  return <span className={cn("badge", tone)}>{Math.round(score)} / 100</span>;
}
