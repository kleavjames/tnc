import type { Metadata } from "next";
import { ResourcesBrowser } from "@/components/resources-browser";
import { listPublishedArticles } from "@/lib/published-articles";

export const metadata: Metadata = {
  title: "Resources",
};

export default async function ResourcesPage() {
  const articles = await listPublishedArticles();
  return <ResourcesBrowser articles={articles} />;
}
