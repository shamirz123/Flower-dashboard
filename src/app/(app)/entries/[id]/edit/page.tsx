import { notFound } from "next/navigation";
import { fetchEntry, fetchSuggestions } from "@/lib/entries";
import { PageHeader } from "@/components/ui";
import { EntryForm } from "../../entry-form";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [entry, suggestions] = await Promise.all([fetchEntry(id), fetchSuggestions()]);
  if (!entry) notFound();
  return (
    <>
      <PageHeader title="Edit entry" subtitle={`${entry.flower} · ${entry.box}`} />
      <EntryForm entry={entry} suggestions={suggestions} />
    </>
  );
}
