import { defineField, defineType } from "sanity";

export default defineType({
  name: "comment",
  title: "Kommentar",
  type: "document",
  fields: [
    defineField({
      name: "articleId",
      title: "Artikel-ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "authorName",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "authorEmail",
      title: "E-Mail (nicht öffentlich)",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Kommentar",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Ausstehend", value: "pending" },
          { title: "Freigegeben", value: "approved" },
          { title: "Abgelehnt", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "authorName",
      subtitle: "body",
    },
  },
});
