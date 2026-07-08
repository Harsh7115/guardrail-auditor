import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Download, LucideIcon } from "lucide-react";

// ── Eyebrow ────────────────────────────────────────────────────────────────
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-xs font-semibold uppercase tracking-wide text-accent", className)}>
      {children}
    </p>
  );
}

// ── SectionHeader ──────────────────────────────────────────────────────────
export function SectionHeader({
  eyebrow,
  title,
  subhead,
  align = "left",
  className
}: {
  eyebrow?: string;
  title: ReactNode;
  subhead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="text-[2.125rem] font-[750] leading-[1.1] tracking-[-0.03em] text-ink">{title}</h2>
      {subhead && <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink-3">{subhead}</p>}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  as: Tag = "div"
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <Tag className={cn("rounded-card border border-line bg-surface p-6", className)}>{children}</Tag>;
}

// ── Button ─────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-black/90 border border-transparent",
  secondary: "bg-surface text-ink border border-line hover:bg-canvas",
  ghost: "bg-transparent text-ink-3 hover:text-ink hover:bg-accent-soft border border-transparent"
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-control px-[18px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  type?: "button" | "submit";
  icon?: LucideIcon;
  disabled?: boolean;
};

export function Button({ children, variant = "primary", href, className, type = "button", icon: Icon, disabled }: ButtonProps) {
  const classes = cn(buttonBase, buttonVariants[variant], className);
  const inner = (
    <>
      {Icon && <Icon size={15} strokeWidth={2} />}
      {children}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled}>
      {inner}
    </button>
  );
}

// ── MetricCard ─────────────────────────────────────────────────────────────
export function MetricCard({
  label,
  value,
  hint,
  valueClassName
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-4">{label}</p>
      <p className={cn("mt-2 text-3xl font-[650] tracking-tight text-ink", valueClassName)}>{value}</p>
      {hint && <p className="mt-2 text-sm leading-6 text-ink-4">{hint}</p>}
    </div>
  );
}

// ── ExportButton ───────────────────────────────────────────────────────────
export function ExportButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className={cn(buttonBase, buttonVariants.secondary, "px-4 py-2")}
      // exports are file downloads served by the API route
    >
      <Download size={15} strokeWidth={2} />
      {label}
    </a>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  body,
  action
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-card border border-line bg-surface px-8 py-14 text-center">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-panel bg-accent-soft text-accent">
        <Icon size={22} strokeWidth={2} />
      </div>
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink-3">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ── SkeletonCard ───────────────────────────────────────────────────────────
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-card border border-line bg-surface p-6", className)}>
      <div className="h-3 w-24 animate-pulse rounded bg-line-3" />
      <div className="mt-4 h-8 w-16 animate-pulse rounded bg-line-3" />
      <div className="mt-3 h-3 w-full animate-pulse rounded bg-line-3" />
    </div>
  );
}

// ── ErrorBanner ────────────────────────────────────────────────────────────
export function ErrorBanner({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-fail/30 bg-fail-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-fail">{title}</p>
        {body && <p className="mt-1 text-sm text-ink-3">{body}</p>}
      </div>
      {action}
    </div>
  );
}
