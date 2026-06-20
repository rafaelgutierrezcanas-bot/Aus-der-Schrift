"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: "1rem" }}>
          Fehler
        </p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.75rem" }}>
          Etwas ist schiefgelaufen.
        </h1>
        <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "2rem" }}>
          Ein unerwarteter Fehler ist aufgetreten.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{ padding: "0.5rem 1.25rem", borderRadius: "999px", border: "1px solid #ccc", cursor: "pointer", fontSize: "0.875rem" }}
          >
            Erneut versuchen
          </button>
          <a
            href="/de"
            style={{ padding: "0.5rem 1.25rem", borderRadius: "999px", background: "#2563eb", color: "white", textDecoration: "none", fontSize: "0.875rem" }}
          >
            Zur Startseite
          </a>
        </div>
      </body>
    </html>
  );
}
