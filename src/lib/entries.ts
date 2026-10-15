import { createClient } from "@/lib/supabase/server";
import type { Entry, EntryStatus } from "@/lib/constants";

const COLUMNS = "id, entry_date, flower, box, recipe_qty, actual_qty, variance, reason, action, status, comment";

export async function fetchEntries(opts: { days?: number; flower?: string; status?: EntryStatus } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("usage_entries")
    .select(COLUMNS)
    .order("entry_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(5000);
  if (opts.days) {
    const since = new Date(Date.now() - opts.days * 86400000).toISOString().slice(0, 10);
    query = query.gte("entry_date", since);
  }
  if (opts.flower) query = query.eq("flower", opts.flower);
  if (opts.status) query = query.eq("status", opts.status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Entry[];
}

export async function fetchEntry(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("usage_entries").select(COLUMNS).eq("id", id).maybeSingle();
  return data as Entry | null;
}

export async function fetchSuggestions() {
  const supabase = await createClient();
  const { data } = await supabase.from("usage_entries").select("flower, box, reason, action").limit(5000);
  const uniq = (key: "flower" | "box" | "reason" | "action") =>
    [...new Set((data ?? []).map((r) => r[key]).filter((v): v is string => !!v))].sort();
  return { flowers: uniq("flower"), boxes: uniq("box"), reasons: uniq("reason"), actions: uniq("action") };
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
