import { ArticleEditor } from "@/components/article-editor";
import { getArticle } from "@/lib/list-articles";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit article",
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) {
    notFound();
  }
  return <ArticleEditor article={article} />;
}
