import Link from "next/link";

interface Props {
  locale: string;
}

export function AuthorCard({ locale }: Props) {
  const bio =
    locale === "de"
      ? "Rafael schreibt über reformierte Theologie, Bibelauslegung und Kirchengeschichte — gründlich, ehrlich und alltagstauglich."
      : "Rafael writes about Reformed theology, biblical exegesis, and church history — thorough, honest, and practically grounded.";

  const linkLabel =
    locale === "de" ? "Mehr über Rafael" : "More about Rafael";

  return (
    <aside
      className="mt-12 pt-8 border-t border-border max-w-prose mx-auto"
      aria-label={locale === "de" ? "Über den Autor" : "About the author"}
    >
      <div className="flex items-start gap-4 p-5 rounded-sm border border-border bg-surface">
        <div
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-border text-sm font-semibold text-muted select-none"
          style={{ fontFamily: "var(--font-sans)" }}
          aria-hidden="true"
        >
          RG
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-semibold text-foreground mb-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Rafael Gutierrez
          </p>
          <p
            className="text-sm text-muted leading-relaxed mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {bio}
          </p>
          <Link
            href={`/${locale}/zu-meiner-person`}
            className="text-xs text-accent hover:underline"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {linkLabel}
          </Link>
        </div>
      </div>
    </aside>
  );
}
