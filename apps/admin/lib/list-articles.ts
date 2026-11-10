import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ARTICLE_TYPE_LABELS,
  type Article,
  type ArticleStatus,
  type ArticleType,
} from "./articles";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

const ARTICLE_TYPES = new Set<ArticleType>(
  Object.keys(ARTICLE_TYPE_LABELS) as ArticleType[],
);
const ARTICLE_STATUSES = new Set<ArticleStatus>([
  "draft",
  "unpublish",
  "published",
]);

export type ArticleRecord = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  verse: string;
  tags: string[];
  type: ArticleType;
  articleStatus: ArticleStatus;
  sermonDate: string | null;
  imageKey: string | null;
  fileKey: string | null;
  videoLink: string | null;
  audioLink: string | null;
  seriesId: string | null;
};

export async function getArticle(id: string): Promise<ArticleRecord | null> {
  const response = await fetch(
    `${apiBaseUrl()}/articles/${encodeURIComponent(id)}`,
    {
      headers: { authorization: `Bearer ${await sessionToken()}` },
      cache: "no-store",
    },
  );
  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Could not load the article.");
  }
  return parseArticleRecord(await response.json());
}

export async function listArticles(): Promise<Article[]> {
  const token = await sessionToken();

  const response = await fetch(`${apiBaseUrl()}/articles`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (!response.ok) {
    throw new Error("Could not load articles.");
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error("Could not load articles.");
  }

  return body.flatMap((item) => {
    const article = parseArticle(item);
    return article ? [article] : [];
  });
}

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }
  return token;
}

function parseArticleRecord(value: unknown): ArticleRecord {
  if (!value || typeof value !== "object") {
    throw new Error("Could not load the article.");
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    !isArticleType(record.type) ||
    !isArticleStatus(record.articleStatus)
  ) {
    throw new Error("Could not load the article.");
  }
  return {
    id: record.id,
    title: record.title,
    subtitle: typeof record.subtitle === "string" ? record.subtitle : "",
    body: typeof record.body === "string" ? record.body : "",
    verse: typeof record.verse === "string" ? record.verse : "",
    tags: Array.isArray(record.tags)
      ? record.tags.filter((item): item is string => typeof item === "string")
      : [],
    type: record.type,
    articleStatus: record.articleStatus,
    sermonDate: sermonDay(record.sermonDate),
    imageKey: typeof record.imageKey === "string" ? record.imageKey : null,
    fileKey: typeof record.fileKey === "string" ? record.fileKey : null,
    videoLink: typeof record.videoLink === "string" ? record.videoLink : null,
    audioLink: typeof record.audioLink === "string" ? record.audioLink : null,
    seriesId: typeof record.seriesId === "string" ? record.seriesId : null,
  };
}

function parseArticle(value: unknown): Article | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.uploadedAt !== "string" ||
    !isArticleType(record.type) ||
    !isArticleStatus(record.articleStatus)
  ) {
    return null;
  }

  return {
    id: record.id,
    title: record.title,
    subtitle: typeof record.subtitle === "string" ? record.subtitle : "",
    verse: typeof record.verse === "string" ? record.verse : "",
    series: typeof record.series === "string" ? record.series : null,
    type: record.type,
    articleStatus: record.articleStatus,
    uploadedAt: record.uploadedAt,
  };
}

function sermonDay(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 10) {
    return null;
  }
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

function isArticleType(value: unknown): value is ArticleType {
  return typeof value === "string" && ARTICLE_TYPES.has(value as ArticleType);
}

function isArticleStatus(value: unknown): value is ArticleStatus {
  return (
    typeof value === "string" && ARTICLE_STATUSES.has(value as ArticleStatus)
  );
}
