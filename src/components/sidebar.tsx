"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, LogOut, Plus, Upload } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Logo } from "@/components/logo";
import { ThemeMenu } from "@/components/theme";

const NAV = [
  { href: "/dashboard", label: "Overview", short: "Overview", icon: LayoutDashboard },
  { href: "/entries", label: "Usage entries", short: "Entries", icon: ListChecks },
  { href: "/entries/import", label: "Import from sheet", short: "Import", icon: Upload },
];

function isActive(pathname: string, href: string) {
  const onImport = pathname.startsWith("/entries/import");
  if (href === "/entries/import") return onImport;
  if (href === "/entries") return pathname.startsWith("/entries") && !onImport;
  return pathname === href;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U"
  );
}

// Phone / small top bar: avatar with a small account popover.
function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-ink transition hover:opacity-90"
      >
        {initials(name)}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-line bg-surface p-2 shadow-xl shadow-black/20">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-fg">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <form action={logout} className="border-t border-line pt-1">
            <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-soft transition hover:bg-surface-2 hover:text-fg">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Sidebar({ pathname, name, email }: { pathname: string; name: string; email: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface md:flex">
      <div className="px-5 pb-4 pt-6">
        <Link href="/dashboard" aria-label="Stemwise home">
          <Logo size={38} />
        </Link>
      </div>

      <div className="px-4 pb-2">
        <Link
          href="/entries/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-ink shadow-sm transition hover:bg-brand-600"
        >
          <Plus size={17} /> New entry
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-3" aria-label="Primary">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Menu</p>
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active ? "bg-brand/10 text-brand" : "text-soft hover:bg-fg/5 hover:text-fg"
                  }`}
                >
                  {active && <span className="absolute -left-4 top-2 h-6 w-1 rounded-r-full bg-brand" />}
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-4">
        <ThemeMenu variant="row" />
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-surface-2 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-ink">
            {initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <form action={logout}>
            <button
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-2 text-muted transition hover:bg-fg/5 hover:text-fg"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ name, email, children }: { name: string; email: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Sidebar pathname={pathname} name={name} email={email} />

      {/* Phones: slim top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-background/80 backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center gap-3 px-4">
          <Link href="/dashboard" aria-label="Stemwise home">
            <Logo size={34} tagline={false} />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeMenu />
            <UserMenu name={name} email={email} />
          </div>
        </div>
      </header>

      <main className="min-w-0 px-4 py-6 sm:px-6 md:ml-64 md:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </main>

      {/* Phones: bottom tab bar */}
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        {NAV.map(({ href, short, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                active ? "text-brand" : "text-muted"
              }`}
            >
              <Icon size={21} />
              {short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
