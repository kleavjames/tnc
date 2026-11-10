import { ResourcesView } from "@/components/resources-view";
import { listArticles } from "@/lib/list-articles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
};

export default async function ResourcesPage() {
  const articles = await listArticles();
  return <ResourcesView articles={articles} />;
}
