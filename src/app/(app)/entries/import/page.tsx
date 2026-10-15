import { PageHeader } from "@/components/ui";
import { Importer } from "./importer";

export default function ImportPage() {
  return (
    <>
      <PageHeader title="Import from sheet" subtitle="Paste your Google Sheet rows to load them in one go" />
      <Importer />
    </>
  );
}
