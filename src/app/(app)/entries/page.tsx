import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, ListChecks, Plus } from "lucide-react";
import { fetchEntriesPage, fetchFlowers, PAGE_SIZE } from "@/lib/entries";
import { formatDate, type EntryStatus } from "@/lib/constants";
import { btnCls, btnGhostCls, Card, Empty, inputCls, PageHeader, StatusBadge, td, th, VarianceBadge } from "@/components/ui";
import { RowActions } from "./row-actions";

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ flower?: string; status?: string; page?: string }>;
}) {
  const { flower, status, page: pageParam } = await searchParams;
  const statusFilter = status === "pending" || status === "complete" ? (status as EntryStatus) : undefined;
  const requested = Math.max(1, Math.floor(Number(pageParam)) || 1);

  const [{ entries, total }, flowers] = await Promise.all([
    fetchEntriesPage({ flower: flower || undefined, status: statusFilter, page: requested }),
    fetchFlowers(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (flower) qs.set("flower", flower);
    if (status) qs.set("status", status);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `/entries?${s}` : "/entries";
  };
  if (requested > pages) redirect(pageHref(pages));
  const page = requested;
  const firstRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  return (
    <>
      <PageHeader
        title="Usage entries"
        subtitle={`${total} ${total === 1 ? "entry" : "entries"}`}
        action={
          <div className="flex flex-wrap gap-3">
            <a href="/entries/export" download className={btnGhostCls}>
              <Download size={16} /> Export CSV
            </a>
            <Link href="/entries/new" className={btnCls}>
              <Plus size={16} /> Add entry
            </Link>
          </div>
        }
      />

      <form className="mb-5 grid grid-cols-2 items-end gap-x-4 gap-y-3 sm:flex sm:flex-wrap">
        <label className="col-span-2 flex flex-col gap-1.5 text-xs font-medium text-muted sm:col-span-1">
          Flower
          <select name="flower" defaultValue={flower ?? ""} className={`${inputCls} sm:w-52`}>
            <option value="">All flowers</option>
            {flowers.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="col-span-2 flex flex-col gap-1.5 text-xs font-medium text-muted sm:col-span-1">
          Status
          <select name="status" defaultValue={status ?? ""} className={`${inputCls} sm:w-40`}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
          </select>
        </label>
        <div className="col-span-2 flex items-center gap-4 sm:col-span-1">
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

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">
                {firstRow}-{firstRow + entries.length - 1} of {total}
              </span>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className={btnGhostCls}>
                    <ChevronLeft size={16} /> Prev
                  </Link>
                )}
                <span className="px-1 tabular-nums text-muted">
                  Page {page} / {pages}
                </span>
                {page < pages && (
                  <Link href={pageHref(page + 1)} className={btnGhostCls}>
                    Next <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </>
  );
}
