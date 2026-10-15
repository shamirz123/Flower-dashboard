"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseDate, parseNumber, type EntryStatus } from "@/lib/constants";

type State = { error?: string } | undefined;

export type ImportRow = {
  date: string;
  flower: string;
  box: string;
  recipe: string;
  actual: string;
  reason: string;
  action: string;
  status: string;
  comment: string;
};

const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim();

export async function saveEntry(_prev: State, formData: FormData): Promise<State> {
  const id = clean(formData.get("id"));
  const flower = clean(formData.get("flower"));
  const box = clean(formData.get("box"));
  if (!flower || !box) return { error: "Flower and box are required." };

  const dateRaw = clean(formData.get("entry_date"));
  const recipe = parseNumber(clean(formData.get("recipe_qty")));
  const actualRaw = clean(formData.get("actual_qty"));
  const actual = parseNumber(actualRaw);
  if (recipe === null) return { error: "Enter a valid recipe quantity." };
  if (actualRaw && actual === null) return { error: "Actual usage must be a number." };

  const row = {
    entry_date: dateRaw ? parseDate(dateRaw) : null,
    flower,
    box,
    recipe_qty: recipe,
    actual_qty: actual,
    reason: clean(formData.get("reason")) || null,
    action: clean(formData.get("action")) || null,
    status: (clean(formData.get("status")) === "complete" ? "complete" : "pending") as EntryStatus,
    comment: clean(formData.get("comment")) || null,
  };
  if (dateRaw && !row.entry_date) return { error: "That date is not valid." };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("usage_entries").update(row).eq("id", id)
    : await supabase.from("usage_entries").insert(row);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/entries");
}

export async function deleteEntry(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("usage_entries").delete().eq("id", clean(formData.get("id")));
  revalidatePath("/", "layout");
}

export async function toggleStatus(formData: FormData) {
  const supabase = await createClient();
  const next = clean(formData.get("status")) === "complete" ? "pending" : "complete";
  await supabase.from("usage_entries").update({ status: next }).eq("id", clean(formData.get("id")));
  revalidatePath("/", "layout");
}

export async function importEntries(rows: ImportRow[]): Promise<{ inserted: number; skipped: number; error?: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { inserted: 0, skipped: 0, error: "Not signed in." };

  const valid = [];
  let skipped = 0;
  for (const r of rows) {
    const recipe = parseNumber(r.recipe);
    if (!r.flower.trim() || !r.box.trim() || recipe === null) {
      skipped++;
      continue;
    }
    valid.push({
      entry_date: parseDate(r.date),
      flower: r.flower.trim(),
      box: r.box.trim(),
      recipe_qty: recipe,
      actual_qty: parseNumber(r.actual),
      reason: r.reason.trim() || null,
      action: r.action.trim() || null,
      status: r.status.trim().toLowerCase() === "complete" ? "complete" : "pending",
      comment: r.comment.trim() || null,
    });
  }

  let inserted = 0;
  for (let i = 0; i < valid.length; i += 500) {
    const chunk = valid.slice(i, i + 500);
    const { error } = await supabase.from("usage_entries").insert(chunk);
    if (error) return { inserted, skipped, error: error.message };
    inserted += chunk.length;
  }
  revalidatePath("/", "layout");
  return { inserted, skipped };
}
