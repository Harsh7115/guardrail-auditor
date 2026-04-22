import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input?: Date | string | null) {
  if (!input) return '-';
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export type Verdict = 'pass' | 'warning' | 'fail';

export function verdictColor(v: Verdict) {
  switch (v) {
    case 'pass':
      return 'badge-pass';
    case 'warning':
      return 'badge-warning';
    case 'fail':
      return 'badge-fail';
  }
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value ?? null, null, 2);
}

export function parseStructuredData<T = unknown>(value?: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
