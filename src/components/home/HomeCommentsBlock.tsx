"use client";

type CommentItem = {
  name: string;
  rating: number;
  text: string;
};

function parseComments(raw: string): CommentItem[] {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const parsed = lines
    .map((line) => {
      const separator = line.includes("|") ? "|" : line.includes(";") ? ";" : null;
      const parts = separator ? line.split(separator) : [line];
      const [namePart, ratingPart, ...rest] = parts;
      const maybeRating = Number((ratingPart ?? "").trim());
      const rating = Number.isNaN(maybeRating) ? 5 : Math.max(1, Math.min(5, maybeRating));
      const text = (separator ? rest.join(separator) : line).trim();
      return {
        name: namePart?.trim() || "Customer",
        rating,
        text: text || "Great quality and fast delivery.",
      };
    })
    .slice(0, 6);
  if (parsed.length) return parsed;
  return [
    { name: "Anna", rating: 5, text: "Very comfortable shoes and premium packaging." },
    { name: "Maria", rating: 5, text: "Exact size fit, quick support and delivery." },
  ];
}

export function HomeCommentsBlock({
  raw,
  fallbackName = "Customer",
  fallbackText = "Great quality and fast delivery.",
  scale = 1,
}: {
  raw: string;
  fallbackName?: string;
  fallbackText?: string;
  scale?: number;
}) {
  const comments = parseComments(raw);
  const safeScale = Math.max(0.62, Math.min(1, scale));
  const isMobileScale = safeScale < 0.82;
  return (
    <div style={{ display: "grid", gap: Math.max(6, 8 * safeScale) }}>
      {comments.map((comment, idx) => (
        <div
          key={`${comment.name}-${idx}`}
          style={{
            border: "1px solid rgba(255,255,255,0.42)",
            borderRadius: 12,
            padding: Math.max(8, 12 * safeScale),
            background: "linear-gradient(180deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08))",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobileScale ? "column" : "row",
              alignItems: isMobileScale ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: Math.max(6, 8 * safeScale),
            }}
          >
            <strong style={{ letterSpacing: "0.01em", fontSize: `${Math.max(11, 14 * safeScale)}px` }}>
              {comment.name || fallbackName}
            </strong>
            <span style={{ color: "#ffd979", fontSize: `${Math.max(12, 16 * safeScale)}px` }}>
              {"★".repeat(comment.rating)}
              <span style={{ color: "rgba(255,255,255,0.55)" }}>
                {"★".repeat(5 - comment.rating)}
              </span>
            </span>
          </div>
          <div
            style={{
              marginTop: Math.max(6, 8 * safeScale),
              opacity: 0.95,
              fontSize: `${Math.max(10, 14.5 * safeScale)}px`,
              lineHeight: 1.45,
            }}
          >
            {comment.text || fallbackText}
          </div>
        </div>
      ))}
    </div>
  );
}
