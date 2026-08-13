import { defineField } from "sanity";

export const bodyField = (name: string, title: string) =>
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
          defineField({
            name: "alt",
            title: "Alt text",
            type: "string",
            description: 'Beschreibt, was im Bild zu sehen ist (z.B. "Schaubild: Aufbau des Praeskripts der Paulusbriefe")',
            validation: (r) => r.required(),
          }),
          { name: "caption", title: "Caption", type: "string" },
        ],
      },
      {
        type: "object",
        name: "excursus",
        title: "Exkurs / Hintergrund",
        fields: [
          {
            name: "title",
            title: "Titel",
            type: "string",
            description: 'z.B. "Historischer Kontext: Das Konzil von Nicäa"',
            validation: (r) => r.required(),
          },
          {
            name: "content",
            title: "Inhalt",
            type: "array",
            of: [{ type: "block" }],
          },
        ],
        preview: {
          select: { title: "title" },
          prepare({ title }: { title?: string }) {
            return { title: `Exkurs: ${title ?? ""}` };
          },
        },
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
