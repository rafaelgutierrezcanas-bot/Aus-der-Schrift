import { defineField, defineType } from "sanity";

export default defineType({
  name: "bookRecommendation",
  title: "Buchempfehlung",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "author", title: "Autor(en)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "year", title: "Jahr", type: "number" }),
    defineField({ name: "coverImage", title: "Cover", type: "image", options: { hotspot: true } }),
    defineField({
      name: "description",
      title: "Kurzbeschreibung",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "difficulty",
      title: "Schwierigkeitsgrad",
      type: "string",
      options: {
        list: [
          { title: "Einsteiger", value: "einsteiger" },
          { title: "Mittel", value: "mittel" },
          { title: "Fortgeschritten", value: "fortgeschritten" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "topics",
      title: "Themen",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Theologie", value: "theologie" },
          { title: "Apologetik", value: "apologetik" },
          { title: "Bibelauslegung", value: "bibelauslegung" },
          { title: "Kirchengeschichte", value: "kirchengeschichte" },
          { title: "Geistliches Leben", value: "geistliches-leben" },
        ],
        layout: "grid",
      },
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: "buyLink", title: "Kauflink", type: "url" }),
  ],
  preview: {
    select: { title: "title", subtitle: "author", media: "coverImage" },
  },
});
