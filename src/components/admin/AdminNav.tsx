"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⊞", exact: true },
  { href: "/admin/artikel", label: "Artikel", icon: "✍️" },
  { href: "/admin/quellen", label: "Quellen", icon: "📚" },
  { href: "/admin/ideen", label: "Ideen", icon: "💡" },
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
            <span className="text-base leading-none">{item.icon}</span>
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
