"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Falsches Passwort");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
        <div className="text-center mb-8">
          <span className="font-serif text-xl text-[var(--color-foreground)] opacity-70 tracking-wide">Theologik</span>
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            autoFocus
            className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-foreground)] bg-[var(--color-surface)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs text-center" style={{ fontFamily: "var(--font-sans)" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-[var(--color-foreground)] text-[var(--color-background)] rounded-lg px-4 py-3 text-sm hover:opacity-80 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Einloggen
        </button>
      </form>
    </div>
  );
}
