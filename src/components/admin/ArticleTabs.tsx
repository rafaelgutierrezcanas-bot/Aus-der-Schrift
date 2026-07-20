"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export type ArticleTab = "inhalt" | "metadaten" | "medien";

const TABS: { id: ArticleTab; label: string }[] = [
  { id: "inhalt", label: "Inhalt" },
  { id: "metadaten", label: "Metadaten" },
  { id: "medien", label: "Medien" },
];

const STORAGE_KEY = "artikel-active-tab";

interface Props {
  activeTab: ArticleTab;
  onChange: (tab: ArticleTab) => void;
}

export function ArticleTabs({ activeTab, onChange }: Props) {
  return (
    <div className="flex p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl w-fit" style={{ fontFamily: "var(--font-sans)" }}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="relative px-5 py-1.5 text-sm font-medium rounded-lg transition-colors"
          style={{ color: activeTab === tab.id ? "var(--color-foreground)" : "var(--color-muted)" }}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm border border-[var(--color-border)]"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export function useArticleTab(): [ArticleTab, (tab: ArticleTab) => void] {
  const [tab, setTab] = useState<ArticleTab>("inhalt");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "inhalt" || saved === "metadaten" || saved === "medien") {
      setTab(saved);
    }
  }, []);

  function changeTab(newTab: ArticleTab) {
    setTab(newTab);
    localStorage.setItem(STORAGE_KEY, newTab);
  }

  return [tab, changeTab];
}
