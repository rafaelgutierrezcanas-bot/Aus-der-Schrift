"use client";

import { useState } from "react";
import { sendContactEmail } from "@/app/actions/contact";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ locale }: { locale: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const isDE = locale === "de";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const result = await sendContactEmail({ name, email, subject, message: body });

      if (result.success) {
        setStatus("sent");
        setName("");
        setEmail("");
        setSubject("");
        setBody("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-sm bg-surface/40 text-foreground text-sm focus:outline-none focus:border-accent transition-colors";

  if (status === "sent") {
    return (
      <div className="border border-accent/30 bg-surface/40 rounded-sm px-6 py-8 text-center">
        <p
          className="text-lg font-semibold mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {isDE ? "Nachricht gesendet!" : "Message sent!"}
        </p>
        <p
          className="text-sm text-muted"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {isDE
            ? "Vielen Dank für deine Nachricht. Ich melde mich so bald wie möglich."
            : "Thank you for your message. I'll get back to you as soon as possible."}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs text-accent hover:underline"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isDE ? "Weitere Nachricht senden" : "Send another message"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isDE ? "Name" : "Name"} *
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          style={{ fontFamily: "var(--font-sans)" }}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isDE ? "E-Mail-Adresse" : "Email address"} *
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          style={{ fontFamily: "var(--font-sans)" }}
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isDE ? "Betreff" : "Subject"} *
        </label>
        <input
          id="subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
          style={{ fontFamily: "var(--font-sans)" }}
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isDE ? "Nachricht" : "Message"} *
        </label>
        <textarea
          id="body"
          rows={6}
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} resize-none`}
          style={{ fontFamily: "var(--font-sans)" }}
        />
      </div>

      <p className="text-[11px] text-muted leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
        {isDE ? (
          <>Deine Daten werden nur zur Bearbeitung deiner Anfrage verwendet. Mehr dazu in der{" "}
            <a href={`/${locale}/datenschutz`} target="_blank" rel="noopener" className="underline hover:text-accent transition-colors">Datenschutzerklärung</a>.
          </>
        ) : (
          <>Your data will only be used to process your inquiry. See our{" "}
            <a href={`/${locale}/datenschutz`} target="_blank" rel="noopener" className="underline hover:text-accent transition-colors">privacy policy</a>.
          </>
        )}
      </p>

      {status === "error" && (
        <p className="text-sm text-red-600">
          {isDE
            ? "Nachricht konnte nicht gesendet werden. Bitte versuche es erneut."
            : "Message could not be sent. Please try again."}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="px-6 py-2.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors text-xs disabled:opacity-50"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {status === "sending"
          ? (isDE ? "Wird gesendet…" : "Sending…")
          : (isDE ? "Nachricht senden" : "Send message")}
      </button>
    </form>
  );
}
