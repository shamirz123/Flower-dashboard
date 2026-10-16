import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchEntry } from "@/lib/entries";
import { PageHeader } from "@/components/ui";
import { EntryForm } from "../../entry-form";
import { SuggestionLists } from "../../suggestion-lists";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await fetchEntry(id);
  if (!entry) notFound();
  return (
    <>
      <PageHeader title="Edit entry" subtitle={`${entry.flower} · ${entry.box}`} />
      <EntryForm entry={entry} />
      <Suspense>
        <SuggestionLists />
      </Suspense>
    </>
  );
}
