"use client";

import { motion } from "framer-motion";
import { PortableText } from "@portabletext/react";

interface Props {
  expertAnalysis: any[];
  color: string;
}

export function ExpertComparison({ expertAnalysis, color }: Props) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-3 rounded-xl border p-4 overflow-hidden"
      style={{
        borderColor: `${color}40`,
        background: `${color}08`,
      }}
    >
      <div
        className="prose dark:prose-invert max-w-none text-sm"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        <PortableText value={expertAnalysis} />
      </div>
    </motion.div>
  );
}
