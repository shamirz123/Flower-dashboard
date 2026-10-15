export type EntryStatus = "pending" | "complete";

export const STATUS_LABEL: Record<EntryStatus, string> = {
  pending: "Pending",
  complete: "Complete",
};

export const REASON_SUGGESTIONS = ["Wrong Recipe", "Small Size", "Head Size", "Damaged", "Short Stem", "Color"];
export const ACTION_SUGGESTIONS = ["Recipe Updated", "Supplier Informed", "Replaced"];

export type Entry = {
  id: string;
  entry_date: string | null;
  flower: string;
  box: string;
  recipe_qty: number;
  actual_qty: number | null;
  variance: number | null;
  reason: string | null;
  action: string | null;
  status: EntryStatus;
  comment: string | null;
};

// Accepts dd-mm-yyyy, dd/mm/yyyy or yyyy-mm-dd. Returns an ISO date or null if it is not a real date.
export function parseDate(input: string | null | undefined): string | null {
  const s = (input ?? "").trim();
  if (!s) return null;
  let y: number, m: number, d: number;
  let match = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    d = Number(match[1]);
    m = Number(match[2]);
    y = Number(match[3]);
  } else if ((match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {
    y = Number(match[1]);
    m = Number(match[2]);
    d = Number(match[3]);
  } else {
    return null;
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  if (y < 2000 || y > 2100) return null;
  return date.toISOString().slice(0, 10);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

export function parseNumber(input: string | null | undefined): number | null {
  const s = (input ?? "").trim().replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
