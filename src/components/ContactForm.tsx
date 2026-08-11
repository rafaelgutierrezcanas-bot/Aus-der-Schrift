"use client";

import { useState } from "react";

export function ContactForm({ locale }: { locale: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const isDE = locale === "de";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const mailBody = `${body}\n\n---\n${name}\n${email}`;
    const mailtoUrl = `mailto:info@theologik.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
    window.location.href = mailtoUrl;
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-sm bg-surface/40 text-foreground text-sm focus:outline-none focus:border-accent transition-colors";

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

      <button
        type="submit"
        className="px-6 py-2.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors text-xs"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {isDE ? "Nachricht senden" : "Send message"}
      </button>
    </form>
  );
}
