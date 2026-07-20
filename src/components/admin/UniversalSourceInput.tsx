"use client";
import { useState, useEffect } from "react";

type DetectedType = "doi" | "isbn" | "apa" | null;

interface ImportedSource {
  title: string;
  authors: string;
  year: number | null;
  publisher?: string;
  city?: string;
  doi?: string;
  isbn?: string;
  type?: string;
  volume?: string;
  issue?: string;
  pages?: string;
}

interface Props {
  onImport: (source: ImportedSource) => void;
}

function detectType(input: string): DetectedType {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // DOI pattern: 10.xxxx/...
  if (/^10\.\d{4,}\/\S+$/.test(trimmed) || /^https?:\/\/doi\.org\/10\.\d{4,}\/\S+$/i.test(trimmed)) {
    return "doi";
  }

  // ISBN pattern: 978-... or 979-... or 10/13 digit number
  const cleaned = trimmed.replace(/[-\s]/g, "");
  if (/^(97[89])?\d{9}[\dX]$/i.test(cleaned)) {
    return "isbn";
  }

  // APA-like: Author (Year). Title...
  if (/\(\d{4}\)/.test(trimmed) && trimmed.length > 20) {
    return "apa";
  }

  return null;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  doi: { label: "DOI erkannt", color: "text-blue-600 bg-blue-50 border-blue-200" },
  isbn: { label: "ISBN erkannt", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  apa: { label: "APA erkannt", color: "text-purple-600 bg-purple-50 border-purple-200" },
};

/** Parse APA string into structured fields (mirrors quellen/neu logic) */
function parseApa(raw: string): ImportedSource {
  const result: Partial<ImportedSource> = { type: "book" };

  const doiMatch = raw.match(/https?:\/\/doi\.org\/([\S]+)/i) || raw.match(/\b(10\.\d{4,}\/[\S]+)/);
  if (doiMatch) result.doi = doiMatch[1] ?? doiMatch[0];

  const yearMatch = raw.match(/\((\d{4})\)/);
  if (yearMatch) result.year = parseInt(yearMatch[1]);

  const yearIdx = yearMatch ? raw.indexOf(yearMatch[0]) : -1;
  if (yearIdx > 0) {
    result.authors = raw.slice(0, yearIdx).trim().replace(/,\s*$/, "").trim();
  }

  const afterYear = yearIdx > 0 ? raw.slice(yearIdx + yearMatch![0].length).trim() : raw;
  const parts = afterYear.split(/\.\s+/).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 1) {
    result.title = parts[0].replace(/\.$/, "").trim();
  }

  if (parts.length >= 2) {
    const rest = parts[1];
    const volIssueMatch = rest.match(/,\s*(\d+)\((\d+)\)/);
    if (volIssueMatch) {
      result.type = "journal";
      result.publisher = rest.slice(0, volIssueMatch.index).replace(/,$/, "").trim();
      result.volume = volIssueMatch[1];
      result.issue = volIssueMatch[2];
      const afterVol = rest.slice((volIssueMatch.index ?? 0) + volIssueMatch[0].length);
      const pagesMatch = afterVol.match(/[\s,]+(\d+[–-]\d+|\d+)/);
      if (pagesMatch) result.pages = pagesMatch[1].replace("-", "–");
    } else {
      const cityPubMatch = rest.match(/^(.+?):\s*(.+)$/);
      if (cityPubMatch) {
        result.city = cityPubMatch[1].trim();
        result.publisher = cityPubMatch[2].replace(/\.$/, "").trim();
      } else {
        result.publisher = rest.replace(/\.$/, "").trim();
      }
    }
  }

  return {
    title: result.title ?? "",
    authors: result.authors ?? "",
    year: result.year ?? null,
    ...result,
  };
}

export default function UniversalSourceInput({ onImport }: Props) {
  const [input, setInput] = useState("");
  const [detected, setDetected] = useState<DetectedType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDetected(detectType(input));
    setError("");
  }, [input]);

  async function handleImport() {
    if (!detected) return;
    setLoading(true);
    setError("");

    try {
      if (detected === "doi") {
        const doi = input.trim().replace(/^https?:\/\/doi\.org\//i, "");
        const res = await fetch(`/api/admin/doi-lookup?doi=${encodeURIComponent(doi)}`);
        if (!res.ok) { setError("DOI nicht gefunden."); return; }
        const data = await res.json();
        onImport(data);
        setInput("");
      } else if (detected === "isbn") {
        const isbn = input.trim().replace(/[-\s]/g, "");
        const res = await fetch(`/api/admin/isbn-lookup?isbn=${encodeURIComponent(isbn)}`);
        if (!res.ok) { setError("ISBN nicht gefunden."); return; }
        const data = await res.json();
        onImport({ ...data, type: "book" });
        setInput("");
      } else if (detected === "apa") {
        const parsed = parseApa(input.trim());
        onImport(parsed);
        setInput("");
      }
    } catch {
      setError("Import fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && detected) handleImport(); }}
          placeholder="DOI, ISBN oder APA-Quellenangabe einfügen..."
          className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-foreground)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-accent)] transition-colors pr-24"
        />
        {detected && (
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full border ${TYPE_LABELS[detected].color}`}>
            {TYPE_LABELS[detected].label}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {detected && (
        <button
          onClick={handleImport}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Importiert..." : "Importieren & Verknüpfen"}
        </button>
      )}
    </div>
  );
}
