import { fetchEntries } from "@/lib/entries";
import { formatDate } from "@/lib/constants";

// Downloads every entry as a CSV that opens directly in Excel.
export async function GET() {
  const entries = await fetchEntries();
  const cell = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["Date", "Flower Name", "Box Size", "Current Recipe", "Actual Usage", "Variance", "Reason", "Action", "Status", "Comment"];
  const lines = entries.map((e) =>
    [
      e.entry_date ? formatDate(e.entry_date) : "",
      e.flower,
      e.box,
      e.recipe_qty,
      e.actual_qty,
      e.variance,
      e.reason,
      e.action,
      e.status === "complete" ? "Complete" : "Pending",
      e.comment,
    ]
      .map(cell)
      .join(","),
  );
  // The BOM makes Excel read the file as UTF-8.
  const body = "﻿" + [header.join(","), ...lines].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="flower-usage-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
