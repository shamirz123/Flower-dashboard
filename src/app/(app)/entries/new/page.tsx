import { fetchSuggestions } from "@/lib/entries";
import { PageHeader } from "@/components/ui";
import { EntryForm } from "../entry-form";

export default async function NewEntryPage() {
  const suggestions = await fetchSuggestions();
  return (
    <>
      <PageHeader title="New usage entry" subtitle="One flower in one box" />
      <EntryForm suggestions={suggestions} />
    </>
  );
}
