"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

// All colors are theme variables, so the charts follow light / dark and stay on the validated series blue.
const SERIES = "var(--series)";
const GRID = "var(--grid)";
const ZERO = "var(--zero)";
const TICK = { fontSize: 12, fill: "var(--muted)" };
const NAME_TICK = { fontSize: 12, fill: "var(--soft)" };
const LABEL = { fontSize: 12, fill: "var(--fg)", fontWeight: 600 };
const TRACK = { fill: "var(--surface-2)", radius: 6 } as const;

type TipProps = { active?: boolean; payload?: { value?: number; payload?: Record<string, unknown> }[]; label?: string | number };

function Tip({ active, payload, label, unit, name }: TipProps & { unit: string; name: string }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value ?? 0;
  const title = String(payload[0].payload?.name ?? label ?? "");
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-xl shadow-black/20">
      <p className="font-medium text-fg">{title}</p>
      <p className="mt-0.5 flex items-center gap-2 text-soft">
        <span className="h-2 w-2 rounded-full bg-series" />
        {name}: <span className="font-semibold text-fg">{v > 0 && unit === "stems" ? `+${v}` : v} {unit}</span>
      </p>
    </div>
  );
}

const fmt = (v: unknown) => {
  const n = Number(v);
  return n > 0 ? `+${n}` : String(n);
};

export function ExtraByFlowerChart({ data }: { data: { name: string; extra: number }[] }) {
  const height = Math.max(220, data.length * 38 + 30);
  return (
    <div style={{ height }} role="img" aria-label="Variance in stems by flower">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={NAME_TICK} tickLine={false} axisLine={false} width={96} />
          <ReferenceLine x={0} stroke={ZERO} />
          <Tooltip cursor={false} content={<Tip unit="stems" name="Variance" />} />
          <Bar dataKey="extra" fill={SERIES} barSize={12} radius={6} background={TRACK}>
            <LabelList dataKey="extra" position="right" formatter={fmt} style={LABEL} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendChart({ data }: { data: { date: string; extra: number }[] }) {
  return (
    <div className="h-64 sm:h-72" role="img" aria-label="Variance over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--series)" stopOpacity={0.25} />
              <stop offset="1" stopColor="var(--series)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tick={TICK} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={TICK} tickLine={false} axisLine={false} width={36} />
          <ReferenceLine y={0} stroke={ZERO} />
          <Tooltip cursor={{ stroke: ZERO }} content={<Tip unit="stems" name="Variance" />} />
          <Area
            type="monotone"
            dataKey="extra"
            stroke={SERIES}
            strokeWidth={2}
            fill="url(#trendFill)"
            dot={{ r: 4, fill: SERIES, stroke: "var(--surface)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: SERIES, stroke: "var(--surface)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReasonsChart({ data }: { data: { name: string; count: number }[] }) {
  const height = Math.max(200, data.length * 44 + 20);
  return (
    <div style={{ height }} role="img" aria-label="Entries by reason">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={NAME_TICK} tickLine={false} axisLine={false} width={112} />
          <Tooltip cursor={false} content={<Tip unit="entries" name="Entries" />} />
          <Bar dataKey="count" fill={SERIES} barSize={12} radius={6} background={TRACK}>
            <LabelList dataKey="count" position="right" style={LABEL} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
