import type { ReactNode } from "react";
import { BarChart3, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeMenu } from "@/components/theme";

const POINTS = [
  { icon: BarChart3, title: "See over-consumption instantly", text: "Recipe vs actual usage per flower and box." },
  { icon: FileSpreadsheet, title: "Bring your Google Sheet", text: "Paste your rows and your dashboard is ready." },
  { icon: ShieldCheck, title: "Private to you", text: "Every account only ever sees its own data." },
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel: desktop only, always dark so it looks the same in both themes */}
      <aside className="relative hidden overflow-hidden bg-[#0a0e0d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative [&_.text-fg]:!text-white [&_.text-muted]:!text-white/50">
          <Logo size={40} />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Know exactly where every stem goes.</h2>
          <p className="mt-4 text-white/60">
            Track flower usage against your recipes, catch waste early, and keep suppliers accountable.
          </p>
          <ul className="mt-10 space-y-5">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand ring-1 ring-white/10">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-white/55">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Stemwise</p>
      </aside>

      {/* Form */}
      <section className="relative flex items-center justify-center bg-background px-5 py-14 sm:px-8">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeMenu />
        </div>
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
