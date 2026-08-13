import { defineField, defineType } from "sanity";
import { bodyField } from "./fields";

export default defineType({
  name: "kurzGefragt",
  title: "Kurz gefragt",
  type: "document",
  fields: [
    defineField({
      name: "questionDe",
      title: "Frage (DE)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "questionEn",
      title: "Question (EN)",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug (DE)",
      type: "slug",
      options: { source: "questionDe" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slugEn",
      title: "Slug (EN)",
      type: "slug",
      options: { source: "questionEn" },
    }),
    defineField({
      name: "verdict",
      title: "Verdict",
      type: "string",
      options: {
        list: [
          { title: "Ja", value: "ja" },
          { title: "Nein", value: "nein" },
          { title: "Teilweise", value: "teilweise" },
          { title: "Umstritten", value: "umstritten" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "shortAnswerDe",
      title: "Kurzantwort (DE)",
      type: "text",
      rows: 3,
      validation: (r) =>
        r
          .required()
          .custom((val) => {
            if (!val) return true;
            const words = val.trim().split(/\s+/).length;
            if (words < 30) return { message: "Kurzantwort sollte mindestens 30 Wörter haben", level: "warning" } as const;
            if (words > 80) return { message: "Kurzantwort sollte maximal 80 Wörter haben", level: "warning" } as const;
            return true;
          }),
    }),
    defineField({
      name: "shortAnswerEn",
      title: "Short Answer (EN)",
      type: "text",
      rows: 3,
    }),
    bodyField("bodyDe", "Inhalt (DE)"),
    bodyField("bodyEn", "Content (EN)"),
    defineField({
      name: "category",
      title: "Kategorie",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "relatedArticles",
      title: "Verwandte Artikel",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "relatedQuestions",
      title: "Verwandte Fragen",
      type: "array",
      of: [{ type: "reference", to: [{ type: "kurzGefragt" }] }],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "publishedAt",
      title: "Veröffentlicht am",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Idee", value: "idea" },
          { title: "Entwurf", value: "draft" },
          { title: "Bereit", value: "ready" },
          { title: "Veröffentlicht", value: "published" },
          { title: "Archiviert", value: "archived" },
          { title: "Papierkorb", value: "trashed" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "language",
      title: "Sprache",
      type: "string",
      options: {
        list: [
          { title: "Nur Deutsch", value: "de" },
          { title: "Only English", value: "en" },
          { title: "Beide / Both", value: "both" },
        ],
        layout: "radio",
      },
      initialValue: "de",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "questionDe", subtitle: "category.titleDe" },
  },
});
