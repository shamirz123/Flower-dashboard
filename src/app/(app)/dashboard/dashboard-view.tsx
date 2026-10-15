import Link from "next/link";
import { AlertTriangle, ClipboardList, Flower2, Plus, Scale, Upload } from "lucide-react";
import { aggregate } from "@/lib/entries";
import type { Entry } from "@/lib/constants";
import { btnCls, btnGhostCls, Card, Empty, Kpi, PageHeader, Sparkline, VarianceBadge } from "@/components/ui";
import { ExtraByFlowerChart, ReasonsChart, TrendChart } from "@/components/charts";

const RANGES = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "All time", value: "all" },
];

export function DashboardView({ entries, range }: { entries: Entry[]; range: string }) {
  const agg = aggregate(entries);
  const spark = agg.trend.map((t) => t.extra);
  const topBoxes = agg.boxes.slice(0, 8);
  const maxBox = Math.max(1, ...topBoxes.map((b) => Math.abs(b.extra)));
  const over = agg.overallPct > 5;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Recipe vs actual flower usage"
        action={
          <div className="scroll-thin flex w-full max-w-full overflow-x-auto rounded-xl border border-line bg-surface p-1 text-sm sm:w-auto">
            {RANGES.map((r) => (
              <Link
                key={r.value}
                href={`/dashboard?range=${r.value}`}
                className={`flex-1 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-center font-medium transition sm:flex-none ${
                  range === r.value ? "bg-brand text-brand-ink" : "text-soft hover:bg-fg/5"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
        }
      />

      {entries.length === 0 ? (
        <Card>
          <Empty icon={Flower2}>
            No usage entries {range === "all" ? "yet" : "in this period"}. Add your first entry or import your Google Sheet.
          </Empty>
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <Link href="/entries/new" className={btnCls}>
              <Plus size={16} /> Add entry
            </Link>
            <Link href="/entries/import" className={btnGhostCls}>
              <Upload size={16} /> Import from sheet
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Hero: the one number the page leads with */}
          <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Over-consumption</p>
                <p className="mt-2 text-6xl font-semibold leading-none tracking-tight text-fg sm:text-7xl">
                  {agg.overallPct}
                  <span className="text-3xl text-muted sm:text-4xl">%</span>
                </p>
                <p className="mt-4 max-w-md text-sm text-soft">
                  {agg.measured === 0 ? (
                    "Add actual usage to your entries to see how much you go over the recipe."
                  ) : (
                    <>
                      <span className={`font-semibold ${over ? "text-bad" : "text-good"}`}>
                        {agg.totalExtra > 0 ? "+" : ""}
                        {agg.totalExtra} stems
                      </span>{" "}
                      {agg.totalExtra > 0 ? "above" : "below"} the recipe across {agg.measured} measured{" "}
                      {agg.measured === 1 ? "entry" : "entries"}.
                    </>
                  )}
                </p>
              </div>
              {spark.length > 1 && (
                <div className="hidden flex-col items-end gap-2 sm:flex">
                  <span className="text-xs text-muted">Trend</span>
                  <div className="scale-150 origin-right">
                    <Sparkline values={spark} />
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <Kpi
              icon={ClipboardList}
              label="Entries"
              value={String(entries.length)}
              hint={`${agg.pending} pending`}
              tone={agg.pending > 0 ? "warn" : "good"}
            />
            <Kpi
              icon={Scale}
              label="Net variance"
              value={`${agg.totalExtra > 0 ? "+" : ""}${agg.totalExtra}`}
              tone={agg.totalExtra > 0 ? "bad" : "good"}
              hint="Stems, actual minus recipe"
              spark={spark}
            />
            <div className="col-span-2 lg:col-span-1">
              <Kpi
                icon={AlertTriangle}
                label="Entries over recipe"
                value={String(agg.overCount)}
                tone={agg.overCount > 0 ? "bad" : "good"}
                hint={`of ${agg.measured} measured`}
              />
            </div>
          </div>

          {agg.measured === 0 ? (
            <Card>
              <Empty>Add actual usage to your entries to see variance charts.</Empty>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
                <Card title="Variance by flower" description="Stems above (+) or below (−) the recipe" className="lg:col-span-3">
                  <ExtraByFlowerChart data={agg.flowers.slice(0, 10).map((f) => ({ name: f.name, extra: f.extra }))} />
                </Card>
                <Card title="Reasons" description="Why usage differed from the recipe" className="lg:col-span-2">
                  {agg.reasons.length ? <ReasonsChart data={agg.reasons} /> : <Empty>No reasons recorded.</Empty>}
                </Card>
              </div>

              <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
                <Card title="Variance over time" description="Net stems per day" className="lg:col-span-3">
                  {agg.trend.length ? <TrendChart data={agg.trend} /> : <Empty>No dated entries yet.</Empty>}
                </Card>
                <Card title="Top boxes" description="Where the most extra stems go" className="lg:col-span-2">
                  <ul className="space-y-4">
                    {topBoxes.map((b) => (
                      <li key={b.name}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate font-medium text-fg">{b.name}</span>
                          <span className="flex shrink-0 items-center gap-3">
                            <span className="text-xs tabular-nums text-muted">
                              {b.pct === 0 && b.extra > 0 ? "" : `${b.pct}%`}
                            </span>
                            <VarianceBadge value={b.extra} />
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full bg-series"
                            style={{ width: `${Math.max(3, (Math.abs(b.extra) / maxBox) * 100)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
