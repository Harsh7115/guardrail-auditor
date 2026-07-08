import { cn } from "@/lib/utils";

// Conic-gradient score ring — no chart dependency. Ring color tracks the risk
// tier band: Low≥90 green · Moderate≥75 amber · High≥50 orange · Critical red.
function ringColor(score: number): string {
  if (score >= 90) return "#4FB477";
  if (score >= 75) return "#E7B34A";
  if (score >= 50) return "#E07B39";
  return "#E6534B";
}

export function ScoreRing({ score, size = 156 }: { score: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const color = ringColor(clamped);
  const inner = size - 26;
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} 0 ${clamped}%, #F0EFEA ${clamped}% 100%)`
      }}
      role="img"
      aria-label={`Safety score ${clamped} out of 100`}
    >
      <div
        className="grid place-items-center rounded-full bg-surface"
        style={{ width: inner, height: inner }}
      >
        <div className="text-center leading-none">
          <span className="text-[2.125rem] font-[720] tracking-tight text-ink">{clamped}</span>
          <span className="ml-0.5 font-mono text-sm text-ink-4">/100</span>
        </div>
      </div>
    </div>
  );
}

// Small helper for legibility elsewhere.
export function scoreBandClass(score: number): string {
  if (score >= 90) return "text-pass";
  if (score >= 50) return "text-warn";
  return cn("text-fail");
}
