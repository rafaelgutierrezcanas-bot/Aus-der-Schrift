import { defineField } from "sanity";
import { LinkIcon } from "@sanity/icons";

export const linkAnnotations = [
  {
    name: "link",
    type: "object" as const,
    title: "Externer Link",
    fields: [
      defineField({
        name: "href",
        type: "url",
        title: "URL",
        validation: (r) =>
          r.required().uri({
            allowRelative: true,
            scheme: ["http", "https", "mailto", "tel"],
          }),
      }),
    ],
  },
  {
    name: "internalLink",
    type: "object" as const,
    title: "Interner Link",
    icon: LinkIcon,
    fields: [
      defineField({
        name: "reference",
        type: "reference",
        title: "Artikel oder Frage",
        to: [{ type: "article" }, { type: "kurzGefragt" }],
      }),
    ],
  },
];

const richBlock = {
  type: "block" as const,
  marks: {
    annotations: linkAnnotations,
  },
};

export const bodyField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      richBlock,
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
            of: [richBlock],
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
        name: "application",
        title: "Anwendung",
        fields: [
          {
            name: "title",
            title: "Titel (optional)",
            type: "string",
            description: 'z.B. "Was bedeutet das für uns heute?"',
          },
          {
            name: "content",
            title: "Inhalt",
            type: "array",
            of: [richBlock],
          },
        ],
        preview: {
          select: { title: "title" },
          prepare({ title }: { title?: string }) {
            return { title: `Anwendung: ${title ?? "(ohne Titel)"}` };
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
