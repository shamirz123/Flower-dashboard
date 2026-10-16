"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveEntry } from "./actions";
import { btnCls, btnGhostCls, Card, inputCls, labelCls } from "@/components/ui";
import type { Entry } from "@/lib/constants";

// The autocomplete <datalist>s (ids: flowers, boxes, reasons, actions) are rendered next to the form by <SuggestionLists />.
export function EntryForm({ entry }: { entry?: Entry }) {
  const [state, action, pending] = useActionState(saveEntry, undefined);

  return (
    <form action={action} className="max-w-3xl space-y-4">
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            Flower
            <input name="flower" list="flowers" required defaultValue={entry?.flower} className={`${inputCls} mt-1.5`} />
          </label>
          <label className={labelCls}>
            Box / size
            <input name="box" list="boxes" required defaultValue={entry?.box} className={`${inputCls} mt-1.5`} />
          </label>
          <label className={labelCls}>
            Current recipe
            <input name="recipe_qty" type="number" step="0.01" min={0} required defaultValue={entry?.recipe_qty ?? ""} className={`${inputCls} mt-1.5`} />
          </label>
          <label className={labelCls}>
            Actual usage
            <input name="actual_qty" type="number" step="0.01" min={0} defaultValue={entry?.actual_qty ?? ""} className={`${inputCls} mt-1.5`} />
          </label>
          <label className={labelCls}>
            Date
            <input name="entry_date" type="date" defaultValue={entry?.entry_date ?? new Date().toISOString().slice(0, 10)} className={`${inputCls} mt-1.5`} />
          </label>
          <label className={labelCls}>
            Status
            <select name="status" defaultValue={entry?.status ?? "pending"} className={`${inputCls} mt-1.5`}>
              <option value="pending">Pending</option>
              <option value="complete">Complete</option>
            </select>
          </label>
          <label className={labelCls}>
            Reason
            <input name="reason" list="reasons" defaultValue={entry?.reason ?? ""} className={`${inputCls} mt-1.5`} />
          </label>
          <label className={labelCls}>
            Action
            <input name="action" list="actions" defaultValue={entry?.action ?? ""} className={`${inputCls} mt-1.5`} />
          </label>
          <label className={`${labelCls} sm:col-span-2`}>
            Comment
            <textarea name="comment" rows={2} defaultValue={entry?.comment ?? ""} className={`${inputCls} mt-1.5`} />
          </label>
        </div>
      </Card>

      {state?.error && <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-sm text-bad">{state.error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button disabled={pending} className={btnCls}>
          {pending ? "Saving…" : entry ? "Save changes" : "Add entry"}
        </button>
        <Link href="/entries" className={btnGhostCls}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
