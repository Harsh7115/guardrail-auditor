"use client";

import { useFormStatus } from "react-dom";
import { Play } from "lucide-react";

// Submit button + full-screen running overlay. runAudit() is a single blocking
// server action, so we show an indeterminate "executing" state (not real
// per-suite telemetry) via useFormStatus.pending, then Next redirects to the
// dashboard when the action resolves.
export function RunSubmit({ suites }: { suites: string[] }) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-control bg-ink px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/90 disabled:opacity-60"
      >
        <Play size={15} strokeWidth={2} />
        {pending ? "Running…" : "Run audit"}
      </button>

      {pending && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-canvas/90 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="mx-4 w-full max-w-md rounded-panel border border-line bg-surface p-8 shadow-float">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-accent">
              Running audit · step 3 of 3
            </p>
            <h2 className="mt-3 text-[1.375rem] font-[720] tracking-[-0.02em] text-ink">
              Executing adversarial suites
            </h2>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-line-3">
              <div className="h-full w-1/4 animate-indeterminate rounded-full bg-accent" />
            </div>
            <ul className="mt-6 space-y-2.5">
              {suites.map((s) => (
                <li key={s} className="flex items-center gap-2.5 text-sm text-ink-3">
                  <span className="h-2 w-2 animate-dot rounded-full bg-accent" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-xs text-ink-4">
              Attack → target → judge, per case. Redirects to the dashboard on completion.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
