import { defineField, defineType } from "sanity";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

export default defineType({
  name: "ausarbeitung",
  title: "Ausarbeitung",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Beschreibung", type: "text", rows: 3 }),
    defineField({
      name: "publishedAt",
      title: "Veröffentlicht am",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "topics",
      title: "Themen",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [...TOPIC_OPTIONS],
        layout: "grid",
      },
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "file",
      title: "PDF-Datei",
      type: "file",
      options: { accept: ".pdf" },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt" },
  },
});
