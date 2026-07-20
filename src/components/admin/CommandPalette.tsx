"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface SearchItem {
  type: "article" | "source" | "idea" | "action";
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  action?: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cache all searchable items on first open
  const loadItems = useCallback(async () => {
    if (loaded) return;
    try {
      const [articles, sources, ideas] = await Promise.all([
        fetch("/api/admin/articles").then((r) => r.json()),
        fetch("/api/admin/sources").then((r) => r.json()),
        fetch("/api/admin/ideas").then((r) => r.json()),
      ]);

      const all: SearchItem[] = [
        // Quick actions
        { type: "action", id: "new-article", title: "Neuer Artikel", subtitle: "Schnellaktion", href: "/admin/neu" },
        { type: "action", id: "new-source", title: "Neue Quelle", subtitle: "Schnellaktion", href: "/admin/quellen/neu" },
        { type: "action", id: "new-idea", title: "Neue Idee", subtitle: "Schnellaktion", href: "/admin/ideen/neu" },
        // Articles
        ...articles.map((a: any) => ({
          type: "article" as const,
          id: a._id,
          title: a.titleDe || "Untitled",
          subtitle: `Artikel · ${a.slug?.current ?? ""}`,
          href: `/admin/${a.slug?.current}`,
        })),
        // Sources
        ...sources.map((s: any) => ({
          type: "source" as const,
          id: s._id,
          title: `${s.authors} (${s.year})`,
          subtitle: `Quelle · ${s.title}`,
          href: `/admin/quellen/${s._id}`,
        })),
        // Ideas
        ...ideas.map((i: any) => ({
          type: "idea" as const,
          id: i._id,
          title: i.title || "Untitled",
          subtitle: "Idee",
          href: `/admin/ideen/${i._id}`,
        })),
      ];
      setItems(all);
      setLoaded(true);
    } catch {
      // Ignore errors
    }
  }, [loaded]);

  // Cmd+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      loadItems();
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, loadItems]);

  // Fuzzy filter
  const filtered = query.trim()
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.subtitle?.toLowerCase().includes(q) ?? false)
        );
      })
    : items.filter((i) => i.type === "action"); // Show actions by default

  function execute(item: SearchItem) {
    setOpen(false);
    if (item.href) router.push(item.href);
    else if (item.action) item.action();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      e.preventDefault();
      execute(filtered[selected]);
    }
  }

  const typeIcon: Record<string, string> = {
    action: "⚡",
    article: "📝",
    source: "📖",
    idea: "💡",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
              <span className="text-stone-400 text-sm">⌘K</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Suche nach Artikeln, Quellen, Ideen..."
                className="flex-1 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto">
              {filtered.length === 0 && query && (
                <p className="text-sm text-stone-400 px-4 py-6 text-center">Keine Ergebnisse</p>
              )}
              {filtered.slice(0, 15).map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => execute(item)}
                  onMouseEnter={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selected ? "bg-stone-50" : ""
                  }`}
                >
                  <span className="text-sm shrink-0">{typeIcon[item.type] ?? "·"}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-stone-700 truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-stone-400 truncate">{item.subtitle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-stone-100 text-xs text-stone-400">
              <span>↑↓ navigieren</span>
              <span>↵ öffnen</span>
              <span>esc schließen</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
