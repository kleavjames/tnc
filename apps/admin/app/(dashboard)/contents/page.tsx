import { ContentsForm } from "@/components/contents-form";
import { getContent } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contents",
};

export default async function ContentsPage() {
  const content = await getContent();
  return <ContentsForm content={content} />;
}
