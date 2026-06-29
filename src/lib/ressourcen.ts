export const TOPIC_OPTIONS = [
  { label: "Theologie", value: "theologie" },
  { label: "Apologetik", value: "apologetik" },
  { label: "Bibelauslegung", value: "bibelauslegung" },
  { label: "Kirchengeschichte", value: "kirchengeschichte" },
  { label: "Geistliches Leben", value: "geistliches-leben" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { label: "Einsteiger", value: "einsteiger" },
  { label: "Mittel", value: "mittel" },
  { label: "Fortgeschritten", value: "fortgeschritten" },
] as const;

export type TopicValue = typeof TOPIC_OPTIONS[number]["value"];
export type DifficultyValue = typeof DIFFICULTY_OPTIONS[number]["value"];
