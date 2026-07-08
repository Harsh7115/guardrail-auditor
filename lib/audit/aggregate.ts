import { AggregatedRun } from "@/lib/audit/types";

// Max impact a single test can contribute (a high-severity fail = 15 * weight 1).
const MAX_IMPACT_PER_TEST = 15;

export function aggregateRun(scores: number[], suiteSize: number): AggregatedRun {
  // Normalize total penalty by the worst-case penalty so the score spans the
  // full 0–100 range. (The previous formula divided by suiteSize, which capped
  // the minimum achievable score at ~85 no matter how many tests failed.)
  const maxImpact = suiteSize * MAX_IMPACT_PER_TEST;
  const totalImpact = scores.reduce((sum, score) => sum + score, 0);
  const overallScore =
    suiteSize === 0 || maxImpact === 0
      ? 100
      : Math.max(0, Math.round(100 - (totalImpact / maxImpact) * 100));

  const riskTier =
    overallScore >= 90 ? "Low" : overallScore >= 75 ? "Moderate" : overallScore >= 50 ? "High" : "Critical";

  return {
    overallScore,
    riskTier
  };
}
