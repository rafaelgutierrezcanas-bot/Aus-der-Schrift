import Link from "next/link";
import { client } from "@/sanity/client";

async function getDashboardData() {
  const [articles, sources, ideas, totalArticles, drafts] = await Promise.all([
    client.fetch(`*[_type == "article"] | order(publishedAt desc)[0...5] {
      _id, titleDe, slug, publishedAt, status
    }`),
    client.fetch(`count(*[_type == "source"])`),
    client.fetch(`count(*[_type == "idea"])`),
    client.fetch(`count(*[_type == "article"])`),
    client.fetch(`count(*[_type == "article" && status in ["draft", "idea"]])`),
  ]);
  return { articles, totalArticles, drafts, sources, ideas };
}

const STATUS_COLOR: Record<string, string> = {
  idea:      "bg-purple-100 text-purple-700",
  draft:     "bg-yellow-100 text-yellow-700",
  ready:     "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
  archived:  "bg-[var(--color-surface)] text-[var(--color-muted)]",
};
const STATUS_LABEL: Record<string, string> = {
  idea: "Idee", draft: "Entwurf", ready: "Bereit",
  published: "Veröffentlicht", archived: "Archiviert",
};

export default async function AdminDashboard() {
  const { articles, totalArticles, drafts, sources, ideas } = await getDashboardData();

  const stats = [
    { label: "Artikel gesamt", value: totalArticles, href: "/admin/artikel" },
    { label: "Entwürfe", value: drafts, href: "/admin/artikel" },
    { label: "Quellen", value: sources, href: "/admin/quellen" },
    { label: "Ideen", value: ideas, href: "/admin/ideen" },
  ];

  const quickActions = [
    { label: "Neuer Artikel", href: "/admin/neu", icon: "✍️" },
    { label: "Neue Quelle", href: "/admin/quellen/neu", icon: "📚" },
    { label: "Neue Idee", href: "/admin/ideen/neu", icon: "💡" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <p className="text-2xl font-semibold text-[var(--color-foreground)]" style={{ fontFamily: "var(--font-sans)" }}>{s.value}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-serif text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Schnellzugriff</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <span>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Zuletzt bearbeitet */}
      <div>
        <h2 className="font-serif text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Zuletzt bearbeitet</h2>
        <div className="space-y-2">
          {(articles as Array<{ _id: string; titleDe: string; slug: { current: string }; publishedAt: string; status?: string }>).map((a) => {
            const st = a.status ?? "published";
            return (
              <Link
                key={a._id}
                href={`/admin/${a.slug.current}`}
                className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
              >
                <p className="text-sm font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)]" style={{ fontFamily: "var(--font-sans)" }}>
                  {a.titleDe}
                </p>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[st] ?? STATUS_COLOR.published}`} style={{ fontFamily: "var(--font-sans)" }}>
                    {STATUS_LABEL[st] ?? st}
                  </span>
                  <span className="text-[var(--color-muted)] text-xs" style={{ fontFamily: "var(--font-sans)" }}>
                    {new Date(a.publishedAt).toLocaleDateString("de-DE")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
