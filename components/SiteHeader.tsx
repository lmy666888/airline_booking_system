"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Flights" },
  { href: "/manage", label: "Manage" },
];
export function SiteHeader()
{
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900 transition hover:text-sky-900">
          <span className="text-sky-800">Dairy Flat</span> Airways
        </Link>
        <nav className="flex flex-wrap gap-1" aria-label="Primary">
          {links.map((l) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${active ? "bg-sky-100 text-sky-950 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
