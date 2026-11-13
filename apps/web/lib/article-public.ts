export type ArticleType = "glc" | "lnl" | "sermon";

export type ArticleLanguage = "english" | "tagalog" | "cebuano";

export type PublishedLocale = {
  language: ArticleLanguage;
  title: string;
  subtitle: string;
  verse: string;
  hasFile: boolean;
};

export type PublishedArticleLocale = PublishedLocale & {
  body: string;
  fileName: string | null;
};

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
  hasImage: boolean;
  locales: PublishedLocale[];
};

export type PublishedArticle = Omit<PublishedArticleSummary, "locales"> & {
  body: string;
  tags: string[];
  fileName: string | null;
  videoLink: string | null;
  audioLink: string | null;
  locales: PublishedArticleLocale[];
};

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  glc: "GLC",
  lnl: "Life on Life",
  sermon: "Sermon",
};

export const ARTICLE_LANGUAGE_OPTIONS: {
  value: ArticleLanguage;
  label: string;
}[] = [
  { value: "english", label: "EN" },
  { value: "tagalog", label: "FIL" },
  { value: "cebuano", label: "CEB" },
];

const ARTICLE_TYPES = new Set<string>(Object.keys(ARTICLE_TYPE_LABELS));
const ARTICLE_LANGUAGES = new Set<string>(
  ARTICLE_LANGUAGE_OPTIONS.map((option) => option.value),
);

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

export function isArticleLanguage(value: unknown): value is ArticleLanguage {
  return typeof value === "string" && ARTICLE_LANGUAGES.has(value);
}

export function preferredLanguage(
  locales: { language: ArticleLanguage }[],
  requested?: string | null,
): ArticleLanguage {
  if (
    isArticleLanguage(requested) &&
    locales.some((locale) => locale.language === requested)
  ) {
    return requested;
  }
  if (locales.some((locale) => locale.language === "english")) {
    return "english";
  }
  return locales[0]?.language ?? "english";
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
    typeof record.hasFile === "boolean" &&
    typeof record.hasImage === "boolean" &&
    Array.isArray(record.locales) &&
    record.locales.length > 0 &&
    record.locales.every(isPublishedLocale)
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
    (record.audioLink === null || typeof record.audioLink === "string") &&
    Array.isArray(record.locales) &&
    record.locales.every(isPublishedArticleLocale)
  );
}

function isPublishedLocale(value: unknown): value is PublishedLocale {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    isArticleLanguage(record.language) &&
    typeof record.title === "string" &&
    typeof record.subtitle === "string" &&
    typeof record.verse === "string" &&
    typeof record.hasFile === "boolean"
  );
}

function isPublishedArticleLocale(
  value: unknown,
): value is PublishedArticleLocale {
  if (!isPublishedLocale(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.body === "string" &&
    (record.fileName === null || typeof record.fileName === "string")
  );
}

function part(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((item) => item.type === type)?.value ?? "";
}
