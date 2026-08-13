import Link from "next/link";
import { client } from "@/sanity/client";

const STATUS_DOT: Record<string, string> = {
  idea: "bg-purple-400",
  draft: "bg-amber-400",
  ready: "bg-blue-400",
  published: "bg-green-400",
  archived: "bg-stone-400",
};

const STATUS_LABEL: Record<string, string> = {
  idea: "Idee",
  draft: "Entwurf",
  ready: "Bereit",
  published: "Veröffentlicht",
  archived: "Archiviert",
};

const VERDICT_LABEL: Record<string, string> = {
  ja: "Ja",
  nein: "Nein",
  teilweise: "Teilweise",
  umstritten: "Umstritten",
};

export default async function KurzGefragtListPage() {
  const items = await client.fetch(`
    *[_type == "kurzGefragt" && status != "trashed"] | order(publishedAt desc) {
      _id, questionDe, slug, publishedAt, status, verdict, category->{ titleDe }
    }
  `);

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Kurz gefragt</h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">{(items as unknown[]).length} Fragen</p>
        </div>
        <Link
          href="/admin/kurz-gefragt/neu"
          className="text-xs px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity font-medium"
        >
          + Neue Frage
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        {(items as unknown[]).length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
            Noch keine Fragen vorhanden.
          </div>
        )}
        {(items as Array<Record<string, unknown>>).map((item) => (
          <Link
            key={item._id as string}
            href={`/admin/kurz-gefragt/${item._id}`}
            className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-background)] transition-colors group"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[(item.status as string) ?? ""] ?? "bg-stone-300"}`} />
            <span className="text-sm text-[var(--color-foreground)] font-medium truncate flex-1 group-hover:text-[var(--color-accent)] transition-colors">
              {(item.questionDe as string) || "Ohne Titel"}
            </span>
            {item.verdict ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] shrink-0">
                {VERDICT_LABEL[item.verdict as string] ?? String(item.verdict)}
              </span>
            ) : null}
            {(item.category as Record<string, unknown> | null)?.titleDe ? (
              <span className="text-xs text-[var(--color-accent)] shrink-0">
                {String((item.category as Record<string, unknown>).titleDe)}
              </span>
            ) : null}
            <span className="text-xs text-[var(--color-muted)] shrink-0">
              {STATUS_LABEL[(item.status as string) ?? ""] ?? item.status}
            </span>
            <span className="text-xs text-[var(--color-muted)] shrink-0 tabular-nums">
              {item.publishedAt
                ? new Date(item.publishedAt as string).toLocaleDateString("de-DE", { day: "numeric", month: "short" })
                : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
