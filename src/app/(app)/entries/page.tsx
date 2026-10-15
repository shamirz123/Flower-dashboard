import Link from "next/link";
import { ListChecks, Plus } from "lucide-react";
import { fetchEntries, fetchSuggestions } from "@/lib/entries";
import { formatDate, type EntryStatus } from "@/lib/constants";
import { btnCls, btnGhostCls, Card, Empty, inputCls, PageHeader, StatusBadge, td, th, VarianceBadge } from "@/components/ui";
import { RowActions } from "./row-actions";

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ flower?: string; status?: string }>;
}) {
  const { flower, status } = await searchParams;
  const statusFilter = status === "pending" || status === "complete" ? (status as EntryStatus) : undefined;

  const [entries, suggestions] = await Promise.all([
    fetchEntries({ flower: flower || undefined, status: statusFilter }),
    fetchSuggestions(),
  ]);

  return (
    <>
      <PageHeader
        title="Usage entries"
        subtitle={`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
        action={
          <Link href="/entries/new" className={btnCls}>
            <Plus size={16} /> Add entry
          </Link>
        }
      />

      <form className="mb-4 grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
        <label className="col-span-2 text-xs font-medium text-muted sm:col-span-1">
          Flower
          <select name="flower" defaultValue={flower ?? ""} className={`${inputCls} mt-1 sm:w-52`}>
            <option value="">All flowers</option>
            {suggestions.flowers.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          Status
          <select name="status" defaultValue={status ?? ""} className={`${inputCls} mt-1 sm:w-40`}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
          </select>
        </label>
        <div className="flex items-center gap-3">
          <button className={btnGhostCls}>Filter</button>
          {(flower || status) && (
            <Link href="/entries" className="text-sm text-muted hover:text-fg hover:underline">
              Clear
            </Link>
          )}
        </div>
      </form>

      {entries.length === 0 ? (
        <Card>
          <Empty icon={ListChecks}>No entries found.</Empty>
        </Card>
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <Card className="hidden !p-0 md:block">
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-line bg-surface-2/60">
                    <th className={th}>Date</th>
                    <th className={th}>Flower</th>
                    <th className={th}>Box</th>
                    <th className={`${th} text-right`}>Recipe</th>
                    <th className={`${th} text-right`}>Actual</th>
                    <th className={`${th} text-right`}>Variance</th>
                    <th className={th}>Reason</th>
                    <th className={th}>Action</th>
                    <th className={th}>Status</th>
                    <th className={th}>Comment</th>
                    <th className={th}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {entries.map((e) => (
                    <tr key={e.id} className="transition hover:bg-surface-2/70">
                      <td className={`${td} tabular-nums text-muted`}>{formatDate(e.entry_date)}</td>
                      <td className={`${td} font-medium text-fg`}>{e.flower}</td>
                      <td className={td}>{e.box}</td>
                      <td className={`${td} text-right tabular-nums`}>{e.recipe_qty}</td>
                      <td className={`${td} text-right tabular-nums`}>{e.actual_qty ?? "-"}</td>
                      <td className={`${td} text-right tabular-nums`}>
                        <VarianceBadge value={e.variance} />
                      </td>
                      <td className={td}>{e.reason ?? "-"}</td>
                      <td className={td}>{e.action ?? "-"}</td>
                      <td className={td}>
                        <StatusBadge status={e.status} />
                      </td>
                      <td className={`${td} max-w-[14rem] truncate text-muted`}>{e.comment ?? ""}</td>
                      <td className={td}>
                        <RowActions id={e.id} status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Phones: cards */}
          <ul className="space-y-3 md:hidden">
            {entries.map((e) => (
              <li key={e.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-fg">{e.flower}</p>
                    <p className="truncate text-sm text-muted">{e.box}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted">Recipe</dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums text-fg">{e.recipe_qty}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted">Actual</dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums text-fg">{e.actual_qty ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted">Variance</dt>
                    <dd className="mt-0.5 flex justify-center tabular-nums">
                      <VarianceBadge value={e.variance} />
                    </dd>
                  </div>
                </dl>
                {(e.reason || e.action || e.comment) && (
                  <p className="mt-3 text-sm text-soft">
                    {[e.reason, e.action].filter(Boolean).join(" · ")}
                    {e.comment && <span className="block text-muted">{e.comment}</span>}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
                  <span className="text-xs tabular-nums text-muted">{formatDate(e.entry_date)}</span>
                  <RowActions id={e.id} status={e.status} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
