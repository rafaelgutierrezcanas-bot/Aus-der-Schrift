"use client";
import { useState } from "react";

export interface LektoratChange {
  original: string;
  corrected: string;
  type: "rechtschreibung" | "grammatik" | "stil";
  reason: string;
}

interface Props {
  changes: LektoratChange[];
  onApply: (original: string, corrected: string) => boolean;
  onClose: () => void;
}

const TYPE_CONFIG = {
  rechtschreibung: { label: "Rechtschreibung", className: "bg-red-50 text-red-700 border-red-100" },
  grammatik: { label: "Grammatik", className: "bg-amber-50 text-amber-700 border-amber-100" },
  stil: { label: "Stil", className: "bg-blue-50 text-blue-700 border-blue-100" },
};

type CardState = "pending" | "applied" | "skipped" | "notfound";

export default function LektoratPanel({ changes, onApply, onClose }: Props) {
  const [states, setStates] = useState<Record<number, CardState>>(
    () => Object.fromEntries(changes.map((_, i) => [i, "pending" as CardState]))
  );

  function apply(i: number) {
    const found = onApply(changes[i].original, changes[i].corrected);
    setStates((prev) => ({ ...prev, [i]: found ? "applied" : "notfound" }));
  }

  function skip(i: number) {
    setStates((prev) => ({ ...prev, [i]: "skipped" }));
  }

  const pending = Object.values(states).filter((s) => s === "pending").length;

  // Build display: show what actually changed within the context string
  function getDisplayParts(original: string, corrected: string) {
    const o = original.trim();
    const c = corrected.trim();
    // Find common prefix and suffix to isolate the changed portion
    let start = 0;
    while (start < o.length && start < c.length && o[start] === c[start]) start++;
    let endO = o.length - 1;
    let endC = c.length - 1;
    while (endO >= start && endC >= start && o[endO] === c[endC]) { endO--; endC--; }
    return {
      prefix: o.slice(0, start),
      oldPart: o.slice(start, endO + 1),
      newPart: c.slice(start, endC + 1),
      suffix: o.slice(endO + 1),
    };
  }

  return (
    <div className="border-t border-stone-200 px-6 py-5" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">
          Lektorat
          {pending > 0 && (
            <span className="ml-2 text-stone-500">— {pending} offen</span>
          )}
        </p>
        <button
          onClick={onClose}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Schließen
        </button>
      </div>

      {changes.length === 0 ? (
        <p className="text-sm text-stone-400 italic">Kein Lektorat nötig.</p>
      ) : (
        <div className="space-y-2.5">
          {changes.map((change, i) => {
            const state = states[i];
            const cfg = TYPE_CONFIG[change.type] ?? TYPE_CONFIG.stil;
            const { prefix, oldPart, newPart, suffix } = getDisplayParts(change.original, change.corrected);
            const isDone = state !== "pending";

            return (
              <div
                key={i}
                className={`rounded-xl border border-stone-200 p-4 transition-all ${isDone ? "opacity-40" : ""}`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}>
                    {cfg.label}
                  </span>
                  {state === "applied" && (
                    <span className="text-xs text-green-600 font-medium">✓ Übernommen</span>
                  )}
                  {state === "skipped" && (
                    <span className="text-xs text-stone-400">Übersprungen</span>
                  )}
                  {state === "notfound" && (
                    <span className="text-xs text-red-400">Stelle nicht gefunden</span>
                  )}
                </div>

                {/* Diff display */}
                <div className="text-sm mb-1.5 leading-relaxed">
                  <span className="text-stone-400">{prefix}</span>
                  <span className="line-through text-red-400 mx-0.5">{oldPart}</span>
                  <span className="text-stone-300 mx-0.5">→</span>
                  <span className="font-medium text-green-700 mx-0.5">{newPart}</span>
                  <span className="text-stone-400">{suffix}</span>
                </div>

                {/* Reason */}
                <p className="text-xs text-stone-400 mb-3">{change.reason}</p>

                {/* Actions */}
                {state === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => apply(i)}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      Übernehmen
                    </button>
                    <button
                      onClick={() => skip(i)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium hover:bg-stone-200 transition-colors"
                    >
                      Überspringen
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
