import { createClient } from "@/lib/supabase/server";
import type { Entry, EntryStatus } from "@/lib/constants";

const COLUMNS = "id, entry_date, flower, box, recipe_qty, actual_qty, variance, reason, action, status, comment";

// Supabase/PostgREST returns at most 1000 rows per request, so bigger reads are split into ranges.
const CHUNK = 1000;
export const PAGE_SIZE = 50;

type Filters = { days?: number; flower?: string; status?: EntryStatus };

// Runs one ranged read (rows from..to, inclusive) with the filters applied. Also returns the total match count.
async function readRange(columns: string, opts: Filters, from: number, to: number) {
  const supabase = await createClient();
  let query = supabase
    .from("usage_entries")
    .select(columns, { count: "exact" })
    .order("entry_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id");
  if (opts.days) {
    const since = new Date(Date.now() - opts.days * 86400000).toISOString().slice(0, 10);
    query = query.gte("entry_date", since);
  }
  if (opts.flower) query = query.eq("flower", opts.flower);
  if (opts.status) query = query.eq("status", opts.status);
  return query.range(from, to);
}

// Reads every matching row: first chunk gives the total, the remaining chunks load in parallel.
async function selectAll<T>(columns: string, opts: Filters = {}): Promise<T[]> {
  const first = await readRange(columns, opts, 0, CHUNK - 1);
  if (first.error) throw new Error(first.error.message);
  const rows = (first.data ?? []) as unknown as T[];
  const total = first.count ?? rows.length;
  if (total <= CHUNK) return rows;

  const starts = Array.from({ length: Math.ceil((total - CHUNK) / CHUNK) }, (_, i) => (i + 1) * CHUNK);
  const rest = await Promise.all(
    starts.map(async (from) => {
      const res = await readRange(columns, opts, from, from + CHUNK - 1);
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as unknown as T[];
    }),
  );
  return rows.concat(...rest);
}

export const fetchEntries = (opts: Filters = {}) => selectAll<Entry>(COLUMNS, opts);

// One page of the entries list, plus the total number of matching rows.
export async function fetchEntriesPage(opts: Filters & { page: number }) {
  const fetchPage = (page: number) => readRange(COLUMNS, opts, (page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  let res = await fetchPage(opts.page);
  // Asking for a page past the end (e.g. after deleting the last row of it) is an error: fall back to page 1 for the total.
  if (res.error?.code === "PGRST103") res = await fetchPage(1);
  const { data, error, count } = res;
  if (error) throw new Error(error.message);
  return { entries: (data ?? []) as unknown as Entry[], total: count ?? 0 };
}

export async function fetchEntry(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("usage_entries").select(COLUMNS).eq("id", id).maybeSingle();
  return data as Entry | null;
}

const uniq = (rows: Record<string, string | null>[], key: string) =>
  [...new Set(rows.map((r) => r[key]).filter((v): v is string => !!v))].sort();

// Only the flower names, for the filter dropdown.
export async function fetchFlowers() {
  return uniq(await selectAll<Record<string, string | null>>("flower"), "flower");
}

export async function fetchSuggestions() {
  const rows = await selectAll<Record<string, string | null>>("flower, box, reason, action");
  return { flowers: uniq(rows, "flower"), boxes: uniq(rows, "box"), reasons: uniq(rows, "reason"), actions: uniq(rows, "action") };
}

export const pct = (extra: number, base: number) => (base > 0 ? Math.round((extra / base) * 1000) / 10 : 0);
const round = (n: number) => Math.round(n * 100) / 100;

export function aggregate(entries: Entry[]) {
  const byFlower = new Map<string, { recipe: number; actual: number }>();
  const byBox = new Map<string, { recipe: number; actual: number; entries: number }>();
  const byDay = new Map<string, { recipe: number; actual: number }>();
  const byReason = new Map<string, number>();
  let pending = 0;
  let recipeTotal = 0;
  let actualTotal = 0;
  let overCount = 0;

  for (const e of entries) {
    if (e.status === "pending") pending++;
    if (e.reason) byReason.set(e.reason, (byReason.get(e.reason) ?? 0) + 1);
    if (e.actual_qty === null) continue; // not measured yet

    recipeTotal += e.recipe_qty;
    actualTotal += e.actual_qty;
    if ((e.variance ?? 0) > 0) overCount++;

    const f = byFlower.get(e.flower) ?? { recipe: 0, actual: 0 };
    f.recipe += e.recipe_qty;
    f.actual += e.actual_qty;
    byFlower.set(e.flower, f);

    const b = byBox.get(e.box) ?? { recipe: 0, actual: 0, entries: 0 };
    b.recipe += e.recipe_qty;
    b.actual += e.actual_qty;
    b.entries++;
    byBox.set(e.box, b);

    if (e.entry_date) {
      const d = byDay.get(e.entry_date) ?? { recipe: 0, actual: 0 };
      d.recipe += e.recipe_qty;
      d.actual += e.actual_qty;
      byDay.set(e.entry_date, d);
    }
  }

  const flowers = [...byFlower.entries()]
    .map(([name, v]) => ({ name, recipe: round(v.recipe), actual: round(v.actual), extra: round(v.actual - v.recipe), pct: pct(v.actual - v.recipe, v.recipe) }))
    .sort((a, b) => b.extra - a.extra);
  const boxes = [...byBox.entries()]
    .map(([name, v]) => ({ name, entries: v.entries, extra: round(v.actual - v.recipe), pct: pct(v.actual - v.recipe, v.recipe) }))
    .sort((a, b) => b.extra - a.extra);
  const trend = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date: date.slice(5).split("-").reverse().join("-"), extra: round(v.actual - v.recipe) }));
  const reasons = [...byReason.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return {
    flowers,
    boxes,
    trend,
    reasons,
    pending,
    overCount,
    measured: flowers.length ? entries.filter((e) => e.actual_qty !== null).length : 0,
    totalExtra: round(actualTotal - recipeTotal),
    overallPct: pct(actualTotal - recipeTotal, recipeTotal),
  };
}
