"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importEntries, type ImportRow } from "../actions";
import { btnCls, Card, td, th } from "@/components/ui";
import { parseDate } from "@/lib/constants";

// Column header (lowercase) -> field. Matches the Google Sheet headers.
const HEADERS: Record<string, keyof ImportRow> = {
  date: "date",
  "flower name": "flower",
  flower: "flower",
  "box size": "box",
  box: "box",
  "current recipe": "recipe",
  recipe: "recipe",
  "actual usage": "actual",
  actual: "actual",
  reason: "reason",
  action: "action",
  status: "status",
  comment: "comment",
};

// Parses tab-separated (pasted from Google Sheets) or comma-separated text, with quote support.
function parseTable(text: string): string[][] {
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  const delim = first.includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function toRows(text: string): { rows: ImportRow[]; error?: string } {
  const table = parseTable(text);
  if (table.length < 2) return { rows: [], error: "Paste the header row and at least one data row." };

  const map = table[0].map((h) => HEADERS[h.trim().toLowerCase()]);
  if (!map.includes("flower") || !map.includes("box") || !map.includes("recipe")) {
    return { rows: [], error: "Could not find the columns. Include the header row: Date, Flower Name, Box Size, Current Recipe, Actual Usage, …" };
  }
  const rows = table.slice(1).map((cells) => {
    const r: ImportRow = { date: "", flower: "", box: "", recipe: "", actual: "", reason: "", action: "", status: "", comment: "" };
    map.forEach((field, i) => {
      if (field) r[field] = (cells[i] ?? "").trim();
    });
    return r;
  });
  return { rows };
}

export function Importer() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok?: string; error?: string }>({});

  const { rows, error } = text.trim() ? toRows(text) : { rows: [] as ImportRow[], error: undefined };
  const badDates = rows.filter((r) => r.date && !parseDate(r.date)).length;

  async function onFile(file: File | undefined) {
    if (file) setText(await file.text());
  }

  async function run() {
    setBusy(true);
    setResult({});
    const res = await importEntries(rows);
    setBusy(false);
    if (res.error) {
      setResult({ error: `Imported ${res.inserted} rows, then failed: ${res.error}` });
      return;
    }
    setResult({ ok: `Imported ${res.inserted} rows${res.skipped ? ` (${res.skipped} skipped: missing flower, box or recipe)` : ""}.` });
    setText("");
    router.refresh();
  }

  return (
    <div className="max-w-5xl space-y-4">
      <Card title="1. Copy from your Google Sheet">
        <p className="text-sm text-soft">
          In Google Sheets select the rows <b>including the header row</b>, copy, and paste below. You can also upload a CSV
          (File &gt; Download &gt; CSV). Expected columns: Date, Flower Name, Box Size, Current Recipe, Actual Usage, Reason, Action,
          Status, Comment. The Variance column is calculated automatically.
        </p>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setResult({});
          }}
          rows={8}
          placeholder="Paste rows here…"
          className="mt-3 w-full rounded-xl border border-line bg-surface-2/50 p-3 font-mono text-xs outline-none transition focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/20"
        />
        <input type="file" accept=".csv,.tsv,.txt" onChange={(e) => onFile(e.target.files?.[0])} className="mt-3 block w-full text-sm text-soft file:mr-3 file:rounded-lg file:border-0 file:bg-brand/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/15" />
      </Card>

      {error && <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-sm text-bad">{error}</p>}

      {rows.length > 0 && (
        <Card title={`2. Preview (${rows.length} rows)`}>
          {badDates > 0 && (
            <p className="mb-3 rounded-xl bg-warn/10 px-3.5 py-2.5 text-sm text-warn">
              {badDates} row(s) have a date that is not valid (for example 20-08-0206). They will be imported without a date.
            </p>
          )}
          <div className="max-h-80 overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="sticky top-0 bg-surface">
                <tr>
                  {["Date", "Flower", "Box", "Recipe", "Actual", "Reason", "Action", "Status"].map((h) => (
                    <th key={h} className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td className={td}>{r.date}</td>
                    <td className={td}>{r.flower}</td>
                    <td className={td}>{r.box}</td>
                    <td className={td}>{r.recipe}</td>
                    <td className={td}>{r.actual}</td>
                    <td className={td}>{r.reason}</td>
                    <td className={td}>{r.action}</td>
                    <td className={td}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && <p className="mt-2 text-xs text-muted">Showing the first 50 rows.</p>}
          <p className="mt-3 text-xs text-muted">Importing the same rows twice will create duplicates.</p>
          <button onClick={run} disabled={busy} className={`${btnCls} mt-3`}>
            {busy ? "Importing…" : `Import ${rows.length} rows`}
          </button>
        </Card>
      )}

      {result.ok && <p className="rounded-xl bg-good/10 px-3.5 py-2.5 text-sm text-good">{result.ok}</p>}
      {result.error && <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-sm text-bad">{result.error}</p>}
    </div>
  );
}
