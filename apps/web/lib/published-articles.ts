import { cache } from "react";
import {
  isPublishedArticle,
  isPublishedSummary,
  type PublishedArticle,
  type PublishedArticleSummary,
} from "./article-public";

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export async function listPublishedArticles(): Promise<
  PublishedArticleSummary[]
> {
  const response = await fetch(`${apiBaseUrl()}/articles/published`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Could not load resources.");
  }
  const body: unknown = await response.json();
  if (!Array.isArray(body) || !body.every(isPublishedSummary)) {
    throw new Error("Could not load resources.");
  }
  return body;
}

export const getPublishedArticle = cache(
  async (id: string): Promise<PublishedArticle | null> => {
    const response = await fetch(
      `${apiBaseUrl()}/articles/published/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error("Could not load the article.");
    }
    const body: unknown = await response.json();
    if (!isPublishedArticle(body)) {
      throw new Error("Could not load the article.");
    }
    return body;
  },
);

export async function publishedFileUrl(id: string): Promise<string | null> {
  const response = await fetch(
    `${apiBaseUrl()}/articles/published/${encodeURIComponent(id)}/file`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    return null;
  }
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("url" in body)) {
    return null;
  }
  const url = body.url;
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    return null;
  }
  return url;
}
