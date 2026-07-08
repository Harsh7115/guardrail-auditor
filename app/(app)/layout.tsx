import { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { isLiveMode, DEFAULT_MODEL } from "@/lib/audit/openai-client";

export default function AppLayout({ children }: { children: ReactNode }) {
  const live = isLiveMode();
  return (
    <DashboardShell live={live} model={live ? DEFAULT_MODEL : undefined}>
      {children}
    </DashboardShell>
  );
}
