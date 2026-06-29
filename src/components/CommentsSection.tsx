import { client } from "@/sanity/client";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "./CommentForm";

interface Comment {
  _id: string;
  authorName: string;
  body: string;
  _createdAt: string;
}

interface CommentsSectionProps {
  articleId: string;
  locale: string;
}

export async function CommentsSection({ articleId, locale }: CommentsSectionProps) {
  const comments = await client.fetch<Comment[]>(
    `*[_type == "comment" && article._ref == $articleId && status == "approved"] | order(_createdAt asc) {
      _id, authorName, body, _createdAt
    }`,
    { articleId }
  );

  const isDE = locale === "de";

  return (
    <section className="mt-20 pt-12 border-t border-border max-w-prose mx-auto">
      <h2
        className="text-xl font-semibold mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {isDE
          ? `Kommentare${comments.length > 0 ? ` (${comments.length})` : ""}`
          : `Comments${comments.length > 0 ? ` (${comments.length})` : ""}`}
      </h2>

      {comments.length === 0 ? (
        <p
          className="mb-10 text-sm"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
        >
          {isDE
            ? "Noch keine Kommentare — sei der Erste."
            : "No comments yet — be the first."}
        </p>
      ) : (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border p-6"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <span
                  className="font-medium text-sm"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--color-foreground)" }}
                >
                  {c.authorName}
                </span>
                <span
                  className="text-xs shrink-0"
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
                >
                  {formatDate(c._createdAt, locale)}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--color-foreground)", fontFamily: "var(--font-body-serif)" }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}

      <h3
        className="text-base font-semibold mb-5"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {isDE ? "Kommentar schreiben" : "Leave a comment"}
      </h3>
      <CommentForm articleId={articleId} locale={locale} />
    </section>
  );
}
