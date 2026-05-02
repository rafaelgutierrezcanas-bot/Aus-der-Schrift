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
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-stone-800">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          className="w-full border border-stone-200 rounded-lg px-4 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-stone-800 text-white rounded-lg px-4 py-2 hover:bg-stone-700 transition-colors"
        >
          Einloggen
        </button>
      </form>
    </div>
  );
}
