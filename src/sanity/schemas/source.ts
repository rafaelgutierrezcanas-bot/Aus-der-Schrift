import { defineField, defineType } from "sanity";

export default defineType({
  name: "source",
  title: "Quelle",
  type: "document",
  fields: [
    defineField({
      name: "type",
      title: "Typ",
      type: "string",
      options: {
        list: [
          { title: "Buch", value: "book" },
          { title: "Zeitschriftenartikel", value: "journal" },
          { title: "Dissertation / Hochschulschrift", value: "dissertation" },
          { title: "Website", value: "website" },
          { title: "Bibelausgabe", value: "bible" },
        ],
        layout: "radio",
      },
      initialValue: "book",
      validation: (r) => r.required(),
    }),
    defineField({ name: "authors", title: "Autor(en)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "year", title: "Jahr", type: "number", validation: (r) => r.required() }),
    // For books: publisher name. For journals: journal name.
    defineField({ name: "publisher", title: "Verlag (Bücher) / Zeitschriftenname (Artikel)", type: "string" }),
    // Journal-specific
    defineField({ name: "volume", title: "Band (Volume)", type: "string" }),
    defineField({ name: "issue", title: "Heft (Issue)", type: "string" }),
    // Book-specific
    defineField({ name: "city", title: "Verlagsort", type: "string" }),
    defineField({ name: "edition", title: "Auflage (z. B. 2)", type: "string" }),
    // Common
    defineField({ name: "doi", title: "DOI", type: "string" }),
    defineField({ name: "isbn", title: "ISBN", type: "string" }),
    defineField({ name: "url", title: "URL", type: "url" }),
    defineField({ name: "pages", title: "Seitenbereich (z. B. 129–150)", type: "string" }),
    defineField({ name: "notes", title: "Eigene Notizen", type: "text", rows: 4 }),
    defineField({ name: "fileLink", title: "Link zur Datei (Google Drive, JSTOR etc.)", type: "url" }),
  ],
  preview: {
    select: { title: "title", subtitle: "authors" },
  },
});
