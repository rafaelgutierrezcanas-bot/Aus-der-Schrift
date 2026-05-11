"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1"/>
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1"/>
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1"/>
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1"/>
    </svg>
  );
}
function PenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2l2.5 2.5-7.5 7.5H3v-2.5L10.5 2z"/>
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h5a1 1 0 011 1v10a1 1 0 01-1 1H2V2z"/>
      <path d="M8 3h5a1 1 0 011 1v9a1 1 0 01-1 1H8"/>
    </svg>
  );
}
function BulbIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 1a4.5 4.5 0 00-2 8.5V11h4V9.5A4.5 4.5 0 007.5 1z"/>
      <path d="M5.5 11h4M6 13h3"/>
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4a1 1 0 011-1h3.5l1.5 2H13a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V4z"/>
    </svg>
  );
}

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: GridIcon, exact: true },
  { href: "/admin/artikel", label: "Artikel", Icon: PenIcon },
  { href: "/admin/quellen", label: "Quellen", Icon: BookIcon },
  { href: "/admin/ideen", label: "Ideen", Icon: BulbIcon },
  { href: "/admin/projekte", label: "Projekte", Icon: FolderIcon },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="hidden md:flex flex-col w-52 shrink-0 min-h-screen border-r border-[var(--color-border)] bg-[var(--color-background)] pt-8 pb-6 px-3">
      <div className="mb-8 px-3">
        <span className="font-serif text-sm font-semibold text-[var(--color-foreground)] opacity-60 tracking-wide uppercase">
          Theologik
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive(item.href, item.exact)
                ? "bg-[var(--color-accent)] text-white font-medium"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <item.Icon />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 mt-4 border-t border-[var(--color-border)] pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <span className="text-base">↩</span>
          Ausloggen
        </button>
      </div>
    </aside>
  );
}
