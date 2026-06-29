export const TOPIC_OPTIONS = [
  { title: "Theologie", value: "theologie" },
  { title: "Apologetik", value: "apologetik" },
  { title: "Bibelauslegung", value: "bibelauslegung" },
  { title: "Kirchengeschichte", value: "kirchengeschichte" },
  { title: "Geistliches Leben", value: "geistliches-leben" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { title: "Einsteiger", value: "einsteiger" },
  { title: "Mittel", value: "mittel" },
  { title: "Fortgeschritten", value: "fortgeschritten" },
] as const;

export type TopicValue = typeof TOPIC_OPTIONS[number]["value"];
export type DifficultyValue = typeof DIFFICULTY_OPTIONS[number]["value"];
