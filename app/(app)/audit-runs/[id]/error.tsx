"use client";

import { ErrorBanner } from "@/components/ui/base";

export default function AuditRunError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorBanner
      title="This audit run failed to load"
      body="The run may be mid-execution or the connection dropped. Retry, or open the demo run."
      action={
        <button
          onClick={reset}
          className="rounded-control bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
        >
          Retry
        </button>
      }
    />
  );
}
