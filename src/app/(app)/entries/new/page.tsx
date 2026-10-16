import { Suspense } from "react";
import { PageHeader } from "@/components/ui";
import { EntryForm } from "../entry-form";
import { SuggestionLists } from "../suggestion-lists";

export default function NewEntryPage() {
  return (
    <>
      <PageHeader title="New usage entry" subtitle="One flower in one box" />
      <EntryForm />
      <Suspense>
        <SuggestionLists />
      </Suspense>
    </>
  );
}
