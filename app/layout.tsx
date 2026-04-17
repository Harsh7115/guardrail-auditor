import './globals.css';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight, Shield } from 'lucide-react';

export const metadata = {
  title: 'Guardrail Auditor',
  description: 'Audit and harden LLM applications against prompt injection, data leakage, and grounding failures.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen antialiased text-slate-100')}>
        <div className="app-shell min-h-screen">
          <div className="mx-auto max-w-7xl px-5 pb-16 pt-5 md:px-8">
            <header className="card card-strong mb-8 flex flex-col gap-5 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-violet-200">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-white">Guardrail Auditor</p>
                  <p className="text-sm text-slate-400">Audit pipelines. Preserve evidence. Iterate safely.</p>
                </div>
              </div>
              <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <Link href="/" className="rounded-full border border-transparent px-4 py-2 hover:border-white/10 hover:bg-white/5 hover:text-white">Home</Link>
                <Link href="/projects/new" className="rounded-full border border-transparent px-4 py-2 hover:border-white/10 hover:bg-white/5 hover:text-white">New Project</Link>
                <Link href="/audit-runs/demo-run" className="rounded-full border border-transparent px-4 py-2 hover:border-white/10 hover:bg-white/5 hover:text-white">Demo Run</Link>
              </nav>
              <Link href="/projects/new" className="button-secondary w-full md:w-auto">
                Start New Audit <ArrowUpRight size={15} />
              </Link>
            </header>
            {children}
            <footer className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <span>© {new Date().getFullYear()} Guardrail Auditor</span>
              <span>Built for safer LLM applications.</span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
