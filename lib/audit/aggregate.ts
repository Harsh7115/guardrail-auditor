import { AggregatedRun } from "@/lib/audit/types";

export function aggregateRun(scores: number[], suiteSize: number): AggregatedRun {
  const overallScore = suiteSize === 0 ? 100 : Math.max(0, 100 - scores.reduce((sum, score) => sum + score, 0) / suiteSize);
  const riskTier =
    overallScore >= 90 ? "Low" : overallScore >= 75 ? "Moderate" : overallScore >= 50 ? "High" : "Critical";

  return {
    overallScore,
    riskTier
  };
}
