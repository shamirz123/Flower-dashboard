"use client";

import Link from "next/link";
import { Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { deleteEntry, toggleStatus } from "./actions";

export function RowActions({ id, status }: { id: string; status: string }) {
  const btn = "rounded-lg p-2 text-muted transition hover:bg-fg/5 hover:text-fg";
  return (
    <div className="flex items-center justify-end gap-0.5">
      <form action={toggleStatus}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value={status} />
        <button
          className={`${btn} hover:text-good`}
          title={status === "complete" ? "Mark pending" : "Mark complete"}
          aria-label={status === "complete" ? "Mark pending" : "Mark complete"}
        >
          {status === "complete" ? <RotateCcw size={16} /> : <Check size={16} />}
        </button>
      </form>
      <Link href={`/entries/${id}/edit`} className={btn} title="Edit" aria-label="Edit entry">
        <Pencil size={16} />
      </Link>
      <form
        action={deleteEntry}
        onSubmit={(e) => {
          if (!confirm("Delete this entry?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button className={`${btn} hover:bg-bad/10 hover:text-bad`} title="Delete" aria-label="Delete entry">
          <Trash2 size={16} />
        </button>
      </form>
    </div>
  );
}
