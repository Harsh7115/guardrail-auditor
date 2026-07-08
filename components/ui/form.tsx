import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export const monoInputClass = cn(inputClass, "font-mono");

export function Field({
  label,
  children,
  hint,
  className
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-ink-2">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink-4">{hint}</p>}
    </div>
  );
}
