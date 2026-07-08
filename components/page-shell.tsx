import { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/base";

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-white">
        <ShieldCheck size={17} strokeWidth={2} />
      </span>
      <span className="text-[0.9375rem] font-semibold tracking-tight text-ink">Guardrail Auditor</span>
    </Link>
  );
}

const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#coverage", label: "Coverage" },
  { href: "#evidence", label: "Evidence" },
  { href: "#exports", label: "Exports" }
];

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line-2 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-marketing items-center justify-between px-[30px]">
          <Wordmark />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-ink-3 hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Button href="/projects/new" variant="secondary" className="hidden sm:inline-flex">
              Create Project
            </Button>
            <Button href="/audit-runs/demo-run" variant="primary" icon={Play}>
              Run Demo Audit
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-line-2">
        <div className="mx-auto flex max-w-marketing flex-col gap-3 px-[30px] py-10 sm:flex-row sm:items-center sm:justify-between">
          <Wordmark />
          <p className="font-mono text-xs text-ink-4">
            MVP · demo simulator · not a production security guarantee
          </p>
        </div>
      </footer>
    </div>
  );
}
