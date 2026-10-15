"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const ACCENTS = [
  { id: "emerald", label: "Emerald", color: "#10b981" },
  { id: "rose", label: "Rose", color: "#fb7185" },
  { id: "blue", label: "Blue", color: "#60a5fa" },
  { id: "violet", label: "Violet", color: "#a78bfa" },
];

// Runs before first paint (inlined in <head>) so the saved theme never flashes.
export const THEME_INIT_SCRIPT = `(function(){var r=document.documentElement,a="emerald";try{var t=localStorage.getItem("sw-theme");a=localStorage.getItem("sw-accent")||a;if(t==="light"||t==="dark")r.setAttribute("data-theme",t)}catch(e){}r.setAttribute("data-accent",a)})()`;

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode): the choice just lasts for this visit
  }
}

// variant "icon": compact button (top bars). "row": full-width sidebar item whose menu opens upward.
export function ThemeMenu({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [accent, setAccent] = useState("emerald");
  const ref = useRef<HTMLDivElement>(null);

  // The saved choice lives on <html> (set by the inline init script); read it when the menu opens.
  function toggle() {
    if (!open) {
      const root = document.documentElement;
      const t = root.getAttribute("data-theme");
      setTheme(t === "light" || t === "dark" ? t : "system");
      setAccent(root.getAttribute("data-accent") ?? "emerald");
    }
    setOpen(!open);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pickTheme(t: Theme) {
    setTheme(t);
    const root = document.documentElement;
    if (t === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", t);
    store("sw-theme", t);
  }

  function pickAccent(a: string) {
    setAccent(a);
    document.documentElement.setAttribute("data-accent", a);
    store("sw-accent", a);
  }

  return (
    <div ref={ref} className={`relative ${variant === "row" ? "w-full" : ""}`}>
      {variant === "row" ? (
        <button
          onClick={toggle}
          aria-label="Appearance"
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-soft transition hover:bg-fg/5 hover:text-fg"
        >
          <Palette size={18} />
          Appearance
        </button>
      ) : (
        <button
          onClick={toggle}
          aria-label="Appearance"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-soft transition hover:bg-surface-2 hover:text-fg"
        >
          <Palette size={18} />
        </button>
      )}

      {open && (
        <div
          className={`absolute z-50 w-64 rounded-2xl border border-line bg-surface p-3 shadow-xl shadow-black/20 ${
            variant === "row" ? "bottom-full left-0 mb-2" : "right-0 top-12"
          }`}
        >
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Theme</p>
          <div className="grid grid-cols-3 gap-1.5">
            {THEMES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => pickTheme(id)}
                aria-pressed={theme === id}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
                  theme === id ? "border-brand bg-brand/10 text-fg" : "border-line text-soft hover:bg-surface-2"
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>

          <p className="px-1 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Accent color</p>
          <div className="flex items-center gap-2 px-1">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => pickAccent(a.id)}
                aria-label={a.label}
                aria-pressed={accent === a.id}
                title={a.label}
                style={{ background: a.color }}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105 ${
                  accent === a.id ? "ring-2 ring-fg ring-offset-2 ring-offset-surface" : ""
                }`}
              >
                {accent === a.id && <Check size={15} className="text-black/70" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
