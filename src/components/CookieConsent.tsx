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
      className="fixed bottom-0 inset-x-0 z-[9999] p-4"
      role="dialog"
      aria-label={isDE ? "Cookie-Einstellungen" : "Cookie settings"}
    >
      <div
        className="max-w-lg mx-auto rounded-lg border shadow-lg px-5 py-4 flex flex-col gap-3"
        style={{
          background: "var(--color-surface, #fff)",
          borderColor: "var(--color-border, #e5e5e5)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-foreground)" }}>
          {isDE
            ? "Diese Website verwendet Vercel Analytics zur anonymisierten Auswertung der Seitenaufrufe. Es werden keine Cookies gesetzt, aber Nutzungsdaten an Vercel übermittelt."
            : "This website uses Vercel Analytics for anonymized page view analysis. No cookies are set, but usage data is transmitted to Vercel."}
        </p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          <Link
            href={`/${locale}/datenschutz`}
            className="underline hover:text-[var(--color-accent)]"
          >
            {isDE ? "Datenschutzerklärung" : "Privacy Policy"}
          </Link>
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={decline}
            className="px-4 py-1.5 text-xs rounded-md border transition-colors hover:bg-[var(--color-muted)]/10"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            {isDE ? "Ablehnen" : "Decline"}
          </button>
          <button
            onClick={accept}
            className="px-4 py-1.5 text-xs rounded-md font-medium transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
          >
            {isDE ? "Akzeptieren" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
