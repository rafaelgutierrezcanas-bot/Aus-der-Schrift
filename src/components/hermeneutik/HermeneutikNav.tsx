"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Wrench, BarChart3, Compass } from "lucide-react";

export function HermeneutikNav() {
  const locale = useLocale();
  const t = useTranslations("hermeneutik");
  const pathname = usePathname();
  const base = `/${locale}/ressourcen/hermeneutik`;

  const tabs = [
    { href: base, label: t("overview"), icon: Compass, exact: true },
    { href: `${base}/werkbank`, label: t("workbench"), icon: Wrench, exact: false },
    { href: `${base}/methode`, label: t("method"), icon: BookOpen, exact: false },
    { href: `${base}/fortschritt`, label: t("progress"), icon: BarChart3, exact: false },
  ];

  return (
    <nav className="flex gap-1 mb-8 p-1 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      {tabs.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "font-medium"
                : "opacity-60 hover:opacity-100"
            }`}
            style={isActive ? {
              background: "var(--color-background)",
              color: "var(--color-foreground)",
            } : {
              color: "var(--color-muted)",
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
