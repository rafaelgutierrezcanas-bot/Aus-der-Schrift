"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⊞", exact: true },
  { href: "/admin/artikel", label: "Artikel", icon: "✍️" },
  { href: "/admin/quellen", label: "Quellen", icon: "📚" },
  { href: "/admin/ideen", label: "Ideen", icon: "💡" },
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
          <span className="text-xl leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
