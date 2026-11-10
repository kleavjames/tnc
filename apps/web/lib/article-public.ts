export type ArticleType = "glc" | "lnl" | "sermon";

export type PublishedArticleSummary = {
  id: string;
  title: string;
  subtitle: string;
  verse: string;
  type: ArticleType;
  uploadedAt: string;
  sermonDate: string | null;
  series: string | null;
  hasFile: boolean;
};

export type PublishedArticle = PublishedArticleSummary & {
  body: string;
  tags: string[];
  fileName: string | null;
  videoLink: string | null;
  audioLink: string | null;
};

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  glc: "GLC",
  lnl: "Life on Life",
  sermon: "Sermon",
};

const ARTICLE_TYPES = new Set<string>(Object.keys(ARTICLE_TYPE_LABELS));

const coverDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const messageDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatCoverDate(iso: string): string {
  const parts = coverDate.formatToParts(new Date(iso));
  const weekday = part(parts, "weekday");
  const month = part(parts, "month");
  const day = part(parts, "day");
  return `${weekday} | ${month} ${day}`;
}

export function formatMessageDate(iso: string): string {
  return messageDate.format(new Date(iso));
}

export function articleDate(article: {
  sermonDate: string | null;
  uploadedAt: string;
}): string {
  return article.sermonDate ?? article.uploadedAt;
}

export function articleLabel(article: PublishedArticleSummary): string {
  return article.series ?? ARTICLE_TYPE_LABELS[article.type];
}

export function isPublishedSummary(
  value: unknown,
): value is PublishedArticleSummary {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.subtitle === "string" &&
    typeof record.verse === "string" &&
    typeof record.type === "string" &&
    ARTICLE_TYPES.has(record.type) &&
    typeof record.uploadedAt === "string" &&
    (record.sermonDate === null || typeof record.sermonDate === "string") &&
    (record.series === null || typeof record.series === "string") &&
    typeof record.hasFile === "boolean"
  );
}

export function isPublishedArticle(value: unknown): value is PublishedArticle {
  if (!isPublishedSummary(value) || !value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.body === "string" &&
    Array.isArray(record.tags) &&
    record.tags.every((tag) => typeof tag === "string") &&
    (record.fileName === null || typeof record.fileName === "string") &&
    (record.videoLink === null || typeof record.videoLink === "string") &&
    (record.audioLink === null || typeof record.audioLink === "string")
  );
}

function part(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((item) => item.type === type)?.value ?? "";
}
