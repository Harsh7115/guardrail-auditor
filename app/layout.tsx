import './globals.css';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Guardrail Auditor',
  description: 'Audit and harden LLM applications against prompt injection, data leakage, and grounding failures.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen antialiased bg-slate-50 text-slate-900')}>
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-brand-600 text-white font-bold grid place-items-center">GA</div>
              <div>
                <p className="font-semibold text-lg">Guardrail Auditor</p>
                <p className="text-sm text-slate-500">Audit. Explain. Remediate.</p>
              </div>
            </div>
            <nav className="flex items-center gap-3 text-sm text-slate-600">
              <a href="/" className="hover:text-brand-600">Home</a>
              <a href="/projects/new" className="hover:text-brand-600">New Project</a>
              <a href="/audit-runs/demo-run" className="hover:text-brand-600">Demo Run</a>
            </nav>
          </header>
          {children}
          <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500 flex justify-between">
            <span>© {new Date().getFullYear()} Guardrail Auditor</span>
            <span>Built for safer LLM applications.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
