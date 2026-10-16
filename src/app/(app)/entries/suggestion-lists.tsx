import { fetchSuggestions } from "@/lib/entries";
import { ACTION_SUGGESTIONS, REASON_SUGGESTIONS } from "@/lib/constants";

const merge = (a: string[], b: string[]) => [...new Set([...a, ...b])];

// Autocomplete lists for the entry form. Rendered inside <Suspense> so the form shows up before they finish loading.
export async function SuggestionLists() {
  const s = await fetchSuggestions();
  return (
    <>
      <datalist id="flowers">{s.flowers.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="boxes">{s.boxes.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="reasons">{merge(REASON_SUGGESTIONS, s.reasons).map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="actions">{merge(ACTION_SUGGESTIONS, s.actions).map((v) => <option key={v} value={v} />)}</datalist>
    </>
  );
}
