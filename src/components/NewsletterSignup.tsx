"use client";

import { useState } from "react";

interface Props {
  locale: string;
}

export function NewsletterSignup({ locale }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const heading =
    locale === "de" ? "Wöchentlich aus der Schrift" : "Weekly from Scripture";
  const subtext =
    locale === "de"
      ? "Ein Gedanke zur Bibelauslegung, ein Buch, ein theologischer Begriff — einmal pro Woche."
      : "One thought on biblical interpretation, a book, a theological concept — once a week.";
  const buttonLabel = locale === "de" ? "Abonnieren" : "Subscribe";
  const placeholder = locale === "de" ? "deine@email.de" : "your@email.com";
  const successMessage =
    locale === "de"
      ? "Danke! Du erhältst bald eine Bestätigungsmail."
      : "Thank you! You'll receive a confirmation email shortly.";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section
      className="mt-12 max-w-prose mx-auto"
      aria-label={locale === "de" ? "Newsletter" : "Newsletter signup"}
    >
      <div className="p-6 rounded-sm border border-border bg-surface">
        <p
          className="text-sm font-semibold text-foreground mb-1"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {heading}
        </p>
        <p
          className="text-sm text-muted leading-relaxed mb-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {subtext}
        </p>

        {submitted ? (
          <p
            className="text-sm text-accent"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {successMessage}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2"
            noValidate
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="flex-1 px-3 py-2 text-sm rounded-sm border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
              aria-label={placeholder}
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-sm border border-border bg-background text-foreground hover:text-accent hover:border-accent transition-colors shrink-0"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
