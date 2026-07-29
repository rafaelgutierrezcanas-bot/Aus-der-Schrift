import Link from "next/link";

interface StationNavigationProps {
  prev?: { label: string; href: string };
  next?: { label: string; href: string };
}

export function StationNavigation({ prev, next }: StationNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav
      className="mt-12 pt-8 border-t border-border flex items-center justify-between"
      aria-label="Station-Navigation"
    >
      <div className="min-h-[44px] flex items-center">
        {prev && (
          <Link
            href={prev.href}
            className="text-sm text-navy hover:underline inline-flex items-center gap-1 min-h-[44px] min-w-[44px]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span aria-hidden="true">&larr;</span>
            {prev.label}
          </Link>
        )}
      </div>

      <div className="min-h-[44px] flex items-center">
        {next && (
          <Link
            href={next.href}
            className="text-sm text-navy border border-navy px-4 py-2 hover:bg-navy/5 transition-colors inline-flex items-center gap-1 min-h-[44px]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {next.label}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
