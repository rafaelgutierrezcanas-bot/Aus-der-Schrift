import { defineField, defineType } from "sanity";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

export default defineType({
  name: "infografik",
  title: "Infografik",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", title: "Beschreibung", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Bild",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt-Text",
      type: "string",
      description: "Beschreibt, was in der Infografik zu sehen ist (wichtig für Bildersuche & Barrierefreiheit)",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "articleSlug",
      title: "Artikel-Slug (optional)",
      type: "string",
      description: "Slug des zugehörigen Artikels, z.B. 'mein-artikel'. Leer lassen, wenn die Infografik keinem Artikel zugeordnet ist.",
    }),
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
  ],
  preview: {
    select: { title: "title", media: "image" },
  },
});
