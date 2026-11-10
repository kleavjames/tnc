import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, DownloadIcon } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { articleLabel, formatMessageDate } from "@/lib/article-public";
import { getPublishedArticle } from "@/lib/published-articles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getPublishedArticle(id);
  return { title: article?.title ?? "Resource" };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getPublishedArticle(id);
  if (!article) {
    notFound();
  }

  const meta = [article.verse, formatMessageDate(article.uploadedAt)]
    .filter((item) => item.length > 0)
    .join(" · ");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8 lg:py-16">
      <Link
        href="/resources"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
      >
        <ArrowLeftIcon className="size-4" />
        Resources
      </Link>

      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          {articleLabel(article)}
        </p>
        <h1 className="text-4xl leading-none font-extrabold tracking-tight lg:text-5xl">
          {article.title}
        </h1>
        {article.subtitle ? (
          <p className="text-lg leading-8 text-muted-foreground">
            {article.subtitle}
          </p>
        ) : null}
        {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
      </header>

      {article.body.trim() ? (
        <div
          className="flex flex-col gap-4 text-base leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      ) : null}

      {article.hasFile ? (
        <section className="flex flex-col gap-3 border-t pt-6">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            Download
          </h2>
          {article.fileName ? (
            <p className="text-sm text-muted-foreground">{article.fileName}</p>
          ) : null}
          <a
            href={`/resources/${article.id}/file`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "self-start",
            )}
          >
            <DownloadIcon data-icon="inline-start" />
            Download
          </a>
        </section>
      ) : null}
    </main>
  );
}
