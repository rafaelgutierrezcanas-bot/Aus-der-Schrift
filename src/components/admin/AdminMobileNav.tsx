"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="1" width="5.5" height="5.5" rx="1"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1"/></svg>;
}
function PenIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 2l2.5 2.5-7.5 7.5H3v-2.5L10.5 2z"/></svg>;
}
function BookIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h5a1 1 0 011 1v10a1 1 0 01-1 1H2V2z"/><path d="M8 3h5a1 1 0 011 1v9a1 1 0 01-1 1H8"/></svg>;
}
function BulbIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 1a4.5 4.5 0 00-2 8.5V11h4V9.5A4.5 4.5 0 007.5 1z"/><path d="M5.5 11h4M6 13h3"/></svg>;
}
function FolderIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4a1 1 0 011-1h3.5l1.5 2H13a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V4z"/></svg>;
}

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: GridIcon, exact: true },
  { href: "/admin/artikel", label: "Artikel", Icon: PenIcon },
  { href: "/admin/quellen", label: "Quellen", Icon: BookIcon },
  { href: "/admin/ideen", label: "Ideen", Icon: BulbIcon },
  { href: "/admin/projekte", label: "Projekte", Icon: FolderIcon },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-background)] border-t border-[var(--color-border)] flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
            isActive(item.href, item.exact)
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-muted)]"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <item.Icon />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
