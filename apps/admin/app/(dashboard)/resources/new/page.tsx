import type { Metadata } from "next";
import { ArticleEditor } from "@/components/article-editor";
import { getSeries } from "@/lib/series";

export const metadata: Metadata = {
  title: "New article",
};

export default async function NewArticlePage() {
  const series = await getSeries();
  return <ArticleEditor series={series} />;
}
