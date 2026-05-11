import { defineField, defineType } from "sanity";

const bodyField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      { type: "block" },
      {
        type: "image",
        options: { hotspot: true },
        fields: [
          { name: "alt", title: "Alt text", type: "string" },
          { name: "caption", title: "Caption", type: "string" },
        ],
      },
      {
        type: "object",
        name: "bibleVerse",
        title: "Bible Verse",
        fields: [
          { name: "reference", title: "Reference (e.g. Joh 1,1)", type: "string" },
          { name: "text", title: "Vers-Text", type: "text" },
          { name: "translation", title: "Übersetzung (e.g. LUT)", type: "string" },
        ],
        preview: {
          select: { title: "reference", subtitle: "text" },
        },
      },
    ],
  });

export default defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({ name: "titleDe", title: "Titel (DE)", type: "string" }),
    defineField({ name: "titleEn", title: "Title (EN)", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titleDe" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "category",
      title: "Kategorie",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Veröffentlicht am",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featuredImage",
      title: "Titelbild",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "excerptDe", title: "Vorschautext (DE)", type: "text", rows: 3 }),
    defineField({ name: "excerptEn", title: "Excerpt (EN)", type: "text", rows: 3 }),
    bodyField("bodyDe", "Inhalt (DE)"),
    bodyField("bodyEn", "Content (EN)"),
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
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "titleDe", media: "featuredImage" },
  },
});
