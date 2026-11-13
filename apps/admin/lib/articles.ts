export type ArticleType = "glc" | "lnl" | "sermon";

export type ArticleStatus = "draft" | "unpublish" | "published";

export type ArticleLanguage = "english" | "tagalog" | "cebuano";

export type ArticleLocaleSummary = {
  language: ArticleLanguage;
  articleStatus: ArticleStatus;
};

export type Article = {
  id: string;
  title: string;
  subtitle: string;
  verse: string;
  series: string | null;
  type: ArticleType;
  articleStatus: ArticleStatus;
  uploadedAt: string;
  imageKey: string | null;
  locales: ArticleLocaleSummary[];
};

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  glc: "GLC",
  lnl: "Life on Life",
  sermon: "Sermon",
};

export const ARTICLE_LANGUAGE_LABELS: Record<ArticleLanguage, string> = {
  english: "English",
  tagalog: "Tagalog",
  cebuano: "Cebuano",
};

export const ARTICLE_LANGUAGES: ArticleLanguage[] = [
  "english",
  "tagalog",
  "cebuano",
];
