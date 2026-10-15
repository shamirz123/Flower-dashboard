import { fetchEntries } from "@/lib/entries";
import { DashboardView } from "./dashboard-view";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range = "all" } = await searchParams;
  const days = range === "all" ? undefined : Number(range) || undefined;
  const entries = await fetchEntries({ days });
  return <DashboardView entries={entries} range={range} />;
}
