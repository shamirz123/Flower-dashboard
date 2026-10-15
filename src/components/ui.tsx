import type { ComponentType, ReactNode } from "react";
import { CheckCircle2, Clock3, Inbox, TrendingDown, TrendingUp } from "lucide-react";
import { STATUS_LABEL, type EntryStatus } from "@/lib/constants";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-6 ${className}`}>
      {title && (
        <header className="mb-4">
          <h2 className="text-[15px] font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

const TONES = {
  default: { chip: "bg-brand/10 text-brand", value: "text-fg" },
  good: { chip: "bg-good/10 text-good", value: "text-fg" },
  bad: { chip: "bg-bad/10 text-bad", value: "text-fg" },
  warn: { chip: "bg-warn/10 text-warn", value: "text-fg" },
};

// Tiny trend line (pure SVG). The last point gets a dot so the current value stands out.
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 96;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 6) + 3, h - 4 - ((v - min) / span) * (h - 8)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="hidden shrink-0 overflow-visible sm:block">
      <path d={d} fill="none" stroke="var(--series)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3.5" fill="var(--series)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
  spark,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: keyof typeof TONES;
  icon?: ComponentType<{ size?: number }>;
  spark?: number[];
}) {
  const t = TONES[tone];
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.chip}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className={`text-[28px] font-semibold leading-none tracking-tight sm:text-[34px] ${t.value}`}>{value}</p>
        {spark && <Sparkline values={spark} />}
      </div>
      {hint && <p className="mt-2.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const STATUS_STYLE: Record<EntryStatus, { cls: string; icon: typeof Clock3 }> = {
  pending: { cls: "bg-warn/10 text-warn ring-warn/30", icon: Clock3 },
  complete: { cls: "bg-good/10 text-good ring-good/30", icon: CheckCircle2 },
};

// Status always pairs an icon with its label, so color is never the only signal.
export function StatusBadge({ status }: { status: EntryStatus }) {
  const { cls, icon: Icon } = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <Icon size={13} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function VarianceBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted">-</span>;
  if (value === 0) return <span className="text-sm font-medium text-muted">0</span>;
  const over = value > 0;
  const Icon = over ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${over ? "text-bad" : "text-good"}`}>
      <Icon size={14} />
      {over ? `+${value}` : value}
    </span>
  );
}

export function Empty({ children, icon: Icon = Inbox }: { children: ReactNode; icon?: ComponentType<{ size?: number }> }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fg/5 text-muted">
        <Icon size={22} />
      </span>
      <p className="max-w-xs text-sm text-muted">{children}</p>
    </div>
  );
}

export const th = "whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted";
export const td = "px-4 py-3.5 text-sm text-soft";
export const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-fg shadow-sm outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/20";
export const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-ink shadow-sm transition hover:bg-brand-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";
export const btnGhostCls =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-soft shadow-sm transition hover:bg-surface-2 active:scale-[0.99]";
export const labelCls = "block text-sm font-medium text-soft";
