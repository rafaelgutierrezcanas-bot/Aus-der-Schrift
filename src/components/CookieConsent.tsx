"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "analytics-consent";

export function useAnalyticsConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${CONSENT_KEY}=`))
      ?.split("=")[1];
    if (stored === "true") setConsent(true);
    else if (stored === "false") setConsent(false);
    // null = not yet decided
  }, []);

  return consent;
}

function setConsentCookie(value: boolean) {
  // 365 days
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${CONSENT_KEY}=${value}; path=/; expires=${expires}; SameSite=Lax`;
}

export function CookieConsent({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${CONSENT_KEY}=`));
    if (!stored) setVisible(true);
  }, []);

  if (!visible) return null;

  const isDE = locale === "de";

  function accept() {
    setConsentCookie(true);
    setVisible(false);
    // Reload to activate Analytics
    window.location.reload();
  }

  function decline() {
    setConsentCookie(false);
    setVisible(false);
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-[9999]"
      role="dialog"
      aria-label={isDE ? "Cookie-Einstellungen" : "Cookie settings"}
    >
      <div
        className="max-w-xs rounded-md border shadow-md px-4 py-3 flex items-center gap-3"
        style={{
          background: "var(--color-surface, #fff)",
          borderColor: "var(--color-border, #e5e5e5)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p className="text-[11px] leading-snug" style={{ color: "var(--color-muted)" }}>
          {isDE ? (
            <>
              Diese Seite nutzt anonymisierte Analyse.{" "}
              <Link href={`/${locale}/datenschutz`} className="underline hover:text-[var(--color-accent)]">
                Mehr
              </Link>
            </>
          ) : (
            <>
              This site uses anonymized analytics.{" "}
              <Link href={`/${locale}/datenschutz`} className="underline hover:text-[var(--color-accent)]">
                Learn more
              </Link>
            </>
          )}
        </p>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={decline}
            className="px-2.5 py-1 text-[11px] rounded border transition-colors hover:bg-[var(--color-muted)]/10"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            {isDE ? "Nein" : "No"}
          </button>
          <button
            onClick={accept}
            className="px-2.5 py-1 text-[11px] rounded font-medium transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
