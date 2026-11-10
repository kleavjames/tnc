import { ContentsForm } from "@/components/contents-form";
import { getContent } from "@/lib/content";
import { getSeries } from "@/lib/series";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contents",
};

export default async function ContentsPage() {
  const [content, series] = await Promise.all([getContent(), getSeries()]);
  return <ContentsForm content={content} series={series} />;
}
