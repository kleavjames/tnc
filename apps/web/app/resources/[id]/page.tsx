import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/resource-article";
import { preferredLanguage } from "@/lib/article-public";
import { getPublishedArticle } from "@/lib/published-articles";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ language?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { language } = await searchParams;
  const article = await getPublishedArticle(id);
  if (!article) {
    return { title: "Resource" };
  }
  const selected = preferredLanguage(article.locales, language);
  const locale = article.locales.find((item) => item.language === selected);
  return { title: locale?.title ?? article.title };
}

export default async function ResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ language?: string }>;
}) {
  const { id } = await params;
  const { language } = await searchParams;
  const article = await getPublishedArticle(id);
  if (!article) {
    notFound();
  }
  return <ResourceArticle article={article} initialLanguage={language} />;
}
