import { defineField, defineType } from "sanity";

export default defineType({
  name: "quote",
  title: "Zitat",
  type: "document",
  fields: [
    defineField({
      name: "text",
      title: "Zitattext",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({ name: "author", title: "Autor", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "source",
      title: "Quelle (Buchempfehlung)",
      type: "reference",
      to: [{ type: "bookRecommendation" }],
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
  ],
  preview: {
    select: { title: "text", subtitle: "author" },
  },
});
