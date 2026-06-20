import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p
        className="text-xs uppercase tracking-widest text-accent mb-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        404
      </p>
      <h1
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Seite nicht gefunden
      </h1>
      <p
        className="text-muted text-sm mb-8 max-w-sm leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        Die gesuchte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/de"
        className="text-sm px-4 py-2 rounded-full bg-accent text-white hover:opacity-90 transition-opacity"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Zur Startseite
      </Link>
    </div>
  );
}
