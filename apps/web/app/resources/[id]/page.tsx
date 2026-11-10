import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, DownloadIcon } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import {
  articleDate,
  articleLabel,
  formatMessageDate,
} from "@/lib/article-public";
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

  const meta = [article.verse, formatMessageDate(articleDate(article))]
    .filter((item) => item.length > 0)
    .join(" · ");
  const body = article.body.trim();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8 lg:py-16">
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

      <div
        className={cn(
          "grid items-start gap-8",
          article.hasFile && "lg:grid-cols-[16rem_minmax(0,1fr)]",
        )}
      >
        {article.hasFile ? (
          <aside className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
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
          </aside>
        ) : null}

        {body ? (
          <article
            className={cn(
              "min-w-0 text-[1.0625rem] leading-8 text-foreground",
              "[&_p+p]:mt-6",
              "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-balance [&_h2:first-child]:mt-0",
              "[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3:first-child]:mt-0",
              "[&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-primary/70",
              "[&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6",
              "[&_li]:pl-1 [&_li+_li]:mt-2",
              "[&_blockquote]:my-8 [&_blockquote]:rounded-md [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:bg-muted/35 [&_blockquote]:px-5 [&_blockquote]:py-4",
              "[&_blockquote_p]:text-muted-foreground [&_blockquote_p]:italic",
              "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
              "[&_strong]:font-semibold",
            )}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : null}
      </div>
    </main>
  );
}
