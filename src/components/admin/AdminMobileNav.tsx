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
function QuoteIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h4v4H2V4z"/><path d="M2 8c0 2 1 3 4 3"/><path d="M9 4h4v4H9V4z"/><path d="M9 8c0 2 1 3 4 3"/></svg>;
}
function LibraryIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="3" height="11" rx="0.5"/><rect x="6" y="2" width="3" height="11" rx="0.5"/><rect x="11" y="2" width="3" height="11" rx="0.5"/></svg>;
}
function FileTextIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 1h5.5L12 3.5V14H3V1h1z"/><path d="M8.5 1v3H12"/><line x1="5" y1="7" x2="10" y2="7"/><line x1="5" y1="9.5" x2="10" y2="9.5"/><line x1="5" y1="12" x2="8" y2="12"/></svg>;
}
function StarIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 1l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2 5.2l4-.6L7.5 1z"/></svg>;
}
function ChatIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M1 2h13v9H8.5L5 14v-3H1V2z"/></svg>;
}

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: GridIcon, exact: true },
  { href: "/admin/artikel", label: "Artikel", Icon: PenIcon },
  { href: "/admin/empfohlen", label: "Empfohlen", Icon: StarIcon },
  { href: "/admin/quellen", label: "Quellen", Icon: BookIcon },
  { href: "/admin/ideen", label: "Ideen", Icon: BulbIcon },
  { href: "/admin/projekte", label: "Projekte", Icon: FolderIcon },
  { href: "/admin/buecher", label: "Bücher", Icon: LibraryIcon },
  { href: "/admin/zitate", label: "Zitate", Icon: QuoteIcon },
  { href: "/admin/ausarbeitungen", label: "Ausarbeitungen", Icon: FileTextIcon },
  { href: "/admin/kommentare", label: "Kommentare", Icon: ChatIcon },
];

function GlobeIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="7.5" r="6"/><path d="M1.5 7.5h12"/><path d="M7.5 1.5c2 2.5 2 9 0 12"/><path d="M7.5 1.5c-2 2.5-2 9 0 12"/></svg>;
}

export function AdminMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-background)] border-t border-[var(--color-border)] overflow-x-auto flex"
      style={{ scrollbarWidth: "none" }}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`shrink-0 flex flex-col items-center gap-1 py-3 px-4 text-[10px] transition-colors ${
            isActive(item.href, item.exact)
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-muted)]"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <item.Icon />
          <span className="whitespace-nowrap">{item.label}</span>
        </Link>
      ))}
      <a
        href="/de"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex flex-col items-center gap-1 py-3 px-4 text-[10px] text-[var(--color-muted)] transition-colors"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <GlobeIcon />
        <span className="whitespace-nowrap">Website</span>
      </a>
    </nav>
  );
}
