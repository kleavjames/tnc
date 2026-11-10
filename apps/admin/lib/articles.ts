export type ArticleType = "glc" | "lnl" | "sermon";

export type ArticleStatus = "draft" | "unpublish" | "published";

export type Article = {
  id: string;
  title: string;
  subtitle: string;
  verse: string;
  series: string | null;
  type: ArticleType;
  articleStatus: ArticleStatus;
  uploadedAt: string;
};

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  glc: "GLC",
  lnl: "Life on Life",
  sermon: "Sermon",
};
