import { Verdict, verdictColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function StatusPill({ verdict }: { verdict: Verdict }) {
  return <span className={cn("badge", verdictColor(verdict))}>{verdict.toUpperCase()}</span>;
}
