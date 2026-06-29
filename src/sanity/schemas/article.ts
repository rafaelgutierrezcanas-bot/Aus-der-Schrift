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
    defineField({
      name: "difficulty",
      title: "Schwierigkeitsgrad",
      type: "string",
      description: "Wie fachlich anspruchsvoll ist dieser Artikel?",
      options: {
        list: [
          { title: "Einfach — für jeden verständlich", value: "einfach" },
          { title: "Mittel — Grundwissen hilfreich", value: "mittel" },
          { title: "Anspruchsvoll — theologisches Fachwissen nötig", value: "anspruchsvoll" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "project",
      title: "Projekt / Reihe",
      type: "reference",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "sources",
      title: "Quellen",
      type: "array",
      of: [{ type: "reference", to: [{ type: "source" }] }],
    }),
    defineField({
      name: "entwurf",
      title: "Entwurf",
      type: "array",
      of: [
        {
          type: "object",
          name: "entwurfThema",
          title: "Thema",
          fields: [
            { name: "thema", title: "Thema", type: "string" },
            { name: "notiz", title: "Notiz", type: "text" },
            {
              name: "zitate",
              title: "Zitate",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "entwurfZitat",
                  title: "Zitat",
                  fields: [
                    { name: "sourceId", title: "Quelle ID", type: "string" },
                    { name: "pages", title: "Seite(n)", type: "string" },
                    { name: "text", title: "Zitattext", type: "text" },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: { title: "thema" },
          },
        },
      ],
    }),
    defineField({
      name: "oldSlugs",
      title: "Alte Slugs (Weiterleitungen)",
      type: "array",
      of: [{ type: "string" }],
      description: "Frühere Slugs dieses Artikels — Besucher werden automatisch weitergeleitet.",
      readOnly: true,
    }),
    defineField({
      name: "isRecommended",
      title: "Empfohlen",
      type: "boolean",
      description: "Auf der Startseite im Bereich \"Empfohlen\" anzeigen",
      initialValue: false,
    }),
    defineField({
      name: "isPaper",
      title: "Als akademisches Paper veröffentlichen",
      type: "boolean",
      description: "Aktiviert den Paper-Modus mit Journal-Layout, Abstract und PDF-Export",
      initialValue: false,
    }),
    defineField({
      name: "abstractDe",
      title: "Abstract (DE)",
      type: "text",
      rows: 4,
      description: "Kurzzusammenfassung des Papers auf Deutsch",
    }),
    defineField({
      name: "abstractEn",
      title: "Abstract (EN)",
      type: "text",
      rows: 4,
      description: "Summary of the paper in English",
    }),
    defineField({
      name: "keywords",
      title: "Schlüsselwörter / Keywords",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Schlüsselwörter für SEO und Metadaten",
    }),
  ],
  preview: {
    select: { title: "titleDe", media: "featuredImage" },
  },
});
