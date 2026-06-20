"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p
        className="text-xs uppercase tracking-widest text-accent mb-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {locale === "de" ? "Fehler" : "Error"}
      </p>
      <h1
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {locale === "de"
          ? "Etwas ist schiefgelaufen."
          : "Something went wrong."}
      </h1>
      <p
        className="text-muted text-sm mb-8 max-w-sm leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Diese Seite konnte nicht geladen werden. Du kannst es erneut versuchen oder zur Startseite zurückkehren."
          : "This page could not be loaded. You can try again or return to the homepage."}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="text-sm px-4 py-2 rounded-full border border-border text-muted hover:text-foreground hover:border-accent transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? "Erneut versuchen" : "Try again"}
        </button>
        <Link
          href={`/${locale}`}
          className="text-sm px-4 py-2 rounded-full bg-accent text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? "Zur Startseite" : "Go to homepage"}
        </Link>
      </div>
    </div>
  );
}
