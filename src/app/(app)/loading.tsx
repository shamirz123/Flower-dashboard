// Shown instantly while the next page loads, so clicks in the sidebar never feel stuck.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-56 rounded-lg bg-fg/10" />
        <div className="h-4 w-32 rounded-lg bg-fg/5" />
      </div>
      <div className="space-y-3">
        <div className="h-24 rounded-2xl border border-line bg-surface" />
        <div className="h-24 rounded-2xl border border-line bg-surface" />
        <div className="h-64 rounded-2xl border border-line bg-surface" />
      </div>
    </div>
  );
}
