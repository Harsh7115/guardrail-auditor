"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Settings2,
  Play,
  ListChecks,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// Derive project / run context from the current path so sidebar links point at
// the right resource. Routes: /projects/[id]/..., /audit-runs/[id]/...
function useContextIds(pathname: string) {
  const seg = pathname.split("/").filter(Boolean);
  let projectId: string | undefined;
  let runId: string | undefined;
  if (seg[0] === "projects" && seg[1] && seg[1] !== "new") projectId = seg[1];
  if (seg[0] === "audit-runs" && seg[1]) runId = seg[1];
  return { projectId, runId };
}

type NavItem = { label: string; href: string; icon: LucideIcon; active: boolean };

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <Link
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors",
        item.active ? "bg-accent-soft text-ink" : "text-ink-3 hover:bg-canvas hover:text-ink"
      )}
    >
      <item.icon size={17} strokeWidth={2} className={item.active ? "text-accent" : "text-ink-4"} />
      {item.label}
    </Link>
  );
}

export function DashboardShell({
  children,
  live = false,
  model
}: {
  children: ReactNode;
  live?: boolean;
  model?: string;
}) {
  const pathname = usePathname() || "/";
  const { projectId, runId } = useContextIds(pathname);
  const runHref = runId ? `/audit-runs/${runId}` : "/audit-runs/demo-run";

  const nav: NavItem[] = [
    {
      label: "Dashboard",
      href: runHref,
      icon: LayoutDashboard,
      active: pathname.startsWith("/audit-runs/") && !pathname.includes("/results/")
    },
    {
      label: "Configure",
      href: projectId ? `/projects/${projectId}/configure` : "/projects/new",
      icon: Settings2,
      active: pathname.includes("/configure") || pathname === "/projects/new"
    },
    {
      label: "Run audit",
      href: projectId ? `/projects/${projectId}/run` : "/projects/new",
      icon: Play,
      active: pathname.endsWith("/run")
    },
    {
      label: "Findings",
      href: runHref,
      icon: ListChecks,
      active: pathname.includes("/results/")
    }
  ];

  const crumb =
    pathname === "/projects/new"
      ? "New project"
      : (nav.find((n) => n.active)?.label ?? (pathname.startsWith("/projects") ? "Project" : "Overview"));

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar (left on desktop, top strip on mobile) */}
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-white">
              <ShieldCheck size={17} strokeWidth={2} />
            </span>
            <span className="text-[0.9375rem] font-semibold tracking-tight text-ink">Guardrail</span>
          </Link>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3"
          aria-label="Audit navigation"
        >
          <p className="hidden px-3 pb-1 pt-2 font-mono text-[0.625rem] uppercase tracking-wide text-ink-4 lg:block">
            Project
          </p>
          {nav.map((item) => (
            <SidebarLink key={item.label} item={item} />
          ))}
        </nav>
        <div className="hidden px-5 pt-4 lg:block">
          <div className="rounded-card border border-line bg-canvas p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-dot rounded-full bg-pass-chart" aria-hidden />
              <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-2">
                {live ? "Live mode active" : "Demo mode active"}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-ink-4">
              {live
                ? `OpenAI ${model ?? ""} · real target + LLM-judge.`
                : "Built-in simulator — no provider API keys required."}
            </p>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-2 bg-canvas/80 px-5 backdrop-blur-md md:px-8">
          <p className="font-mono text-xs text-ink-4">
            <span className="text-ink-3">guardrail</span> / {crumb.toLowerCase()}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={projectId ? `/projects/${projectId}/run` : "/projects/new"}
              className="inline-flex items-center gap-2 rounded-control border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink hover:bg-canvas"
            >
              <Play size={14} strokeWidth={2} />
              Re-run
            </Link>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent">
              HJ
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-app flex-1 px-5 py-9 md:px-10">{children}</main>
      </div>
    </div>
  );
}
