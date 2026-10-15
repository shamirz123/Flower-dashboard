// Stemwise mark: three stems of rising height, each topped with a bloom. It reads as a bar chart and as flowers.
// Fills use theme tokens so it follows the chosen accent in light and dark.
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Stemwise logo" className="shrink-0">
      <rect width="40" height="40" rx="12" fill="var(--brand)" />
      <g stroke="var(--brand-ink)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M12 31V23" />
        <path d="M20 31V17" />
        <path d="M28 31V11" />
      </g>
      <g fill="var(--brand-ink)">
        <circle cx="12" cy="20" r="3.2" />
        <circle cx="20" cy="14" r="3.2" />
        <circle cx="28" cy="8" r="3.2" />
      </g>
    </svg>
  );
}

export function Logo({ size = 36, tagline = true }: { size?: number; tagline?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark size={size} />
      <span className="leading-tight">
        <span className="block text-[17px] font-semibold tracking-tight text-fg">Stemwise</span>
        {tagline && <span className="hidden text-[11px] text-muted sm:block">Flower usage control</span>}
      </span>
    </span>
  );
}
