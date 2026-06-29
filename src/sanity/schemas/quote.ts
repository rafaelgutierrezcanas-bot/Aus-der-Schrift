import { defineField, defineType } from "sanity";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

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
        list: [...TOPIC_OPTIONS],
        layout: "grid",
      },
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "author" },
  },
});
