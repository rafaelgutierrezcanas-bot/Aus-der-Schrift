import Link from "next/link";
import { client } from "@/sanity/client";

export default async function SeitenListPage() {
  const items = await client.fetch(`
    *[_type == "page"] | order(_updatedAt desc) {
      _id, titleDe, slug, _updatedAt
    }
  `);

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Seiten</h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">{(items as unknown[]).length} Seiten</p>
        </div>
        <Link
          href="/admin/seiten/neu"
          className="text-xs px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity font-medium"
        >
          + Neue Seite
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        {(items as unknown[]).length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
            Noch keine Seiten vorhanden.
          </div>
        )}
        {(items as Array<Record<string, unknown>>).map((item) => (
          <Link
            key={item._id as string}
            href={`/admin/seiten/${item._id}`}
            className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-background)] transition-colors group"
          >
            <span className="text-sm text-[var(--color-foreground)] font-medium truncate flex-1 group-hover:text-[var(--color-accent)] transition-colors">
              {(item.titleDe as string) || "Ohne Titel"}
            </span>
            <span className="text-xs text-[var(--color-muted)] shrink-0">
              /{(item.slug as { current?: string })?.current ?? ""}
            </span>
            <span className="text-xs text-[var(--color-muted)] shrink-0 tabular-nums">
              {item._updatedAt
                ? new Date(item._updatedAt as string).toLocaleDateString("de-DE", { day: "numeric", month: "short" })
                : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
