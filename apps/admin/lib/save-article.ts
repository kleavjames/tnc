export type ArticleContent = {
  title: string;
  subtitle: string;
  body: string;
  verse: string;
  tags: string[];
  type: "glc" | "lnl" | "sermon";
  sermonDate: string | null;
  imageKey: string | null;
  fileKey: string | null;
  videoLink: string | null;
  audioLink: string | null;
};

export type SavedArticle = {
  id: string;
  articleStatus: "draft" | "unpublish" | "published";
};

export function createDraft(input: ArticleContent): Promise<SavedArticle> {
  return send("/api/articles", "POST", input);
}

export function updateArticle(
  id: string,
  input: ArticleContent,
): Promise<SavedArticle> {
  return send(`/api/articles/${encodeURIComponent(id)}`, "PATCH", input);
}

export function createPublished(input: ArticleContent): Promise<SavedArticle> {
  return send("/api/articles/publish", "POST", input);
}

export function publishArticle(
  id: string,
  input: ArticleContent,
): Promise<SavedArticle> {
  return send(`/api/articles/${encodeURIComponent(id)}/publish`, "POST", input);
}

export function unpublishArticle(id: string): Promise<SavedArticle> {
  return send(`/api/articles/${encodeURIComponent(id)}/unpublish`, "POST");
}

async function send(
  path: string,
  method: "POST" | "PATCH",
  input?: ArticleContent,
): Promise<SavedArticle> {
  const response = await fetch(path, {
    method,
    headers: input ? { "content-type": "application/json" } : undefined,
    body: input ? JSON.stringify(input) : undefined,
  });

  if (!response.ok) {
    let detail = "Could not save the article.";
    try {
      const body = (await response.json()) as { message?: unknown };
      if (typeof body.message === "string") {
        detail = body.message;
      } else if (Array.isArray(body.message)) {
        detail = body.message.join(", ");
      }
    } catch {
      // The status line is enough when the body is not JSON.
    }
    throw new Error(detail);
  }

  const saved = (await response.json()) as {
    id?: unknown;
    articleStatus?: unknown;
  };
  if (
    typeof saved.id !== "string" ||
    saved.id.length === 0 ||
    (saved.articleStatus !== "draft" &&
      saved.articleStatus !== "unpublish" &&
      saved.articleStatus !== "published")
  ) {
    throw new Error("Could not save the article.");
  }
  return { id: saved.id, articleStatus: saved.articleStatus };
}
