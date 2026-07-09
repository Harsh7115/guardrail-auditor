"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";

// Catch-all for the authenticated screens. On the hosted demo the SQLite DB is
// read-only/ephemeral (serverless), so create/configure/run reads and writes
// fail; instead of a raw 500 this renders a friendly, honest message. Locally,
// the Retry recovers from transient errors.
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-card border border-line bg-surface px-8 py-14 text-center">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-panel bg-accent-soft text-accent">
        <Inbox size={22} strokeWidth={2} />
      </div>
      <p className="text-lg font-semibold text-ink">This hosted demo is read-only</p>
      <p className="mt-2 text-sm leading-6 text-ink-3">
        Creating projects and running live audits needs a writable database, which the serverless demo doesn&apos;t
        have. Explore the completed demo run, or clone the repo to run your own audits locally.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/audit-runs/demo-run"
          className="rounded-control bg-ink px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-black/90"
        >
          View demo run
        </Link>
        <button
          onClick={reset}
          className="rounded-control border border-line bg-surface px-[18px] py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
