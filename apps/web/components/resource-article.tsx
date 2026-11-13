"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DownloadIcon,
  HeadphonesIcon,
  PlayIcon,
} from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button";
import { ChoiceGroup } from "@repo/ui/choice-group";
import { cn } from "@repo/ui/lib/utils";
import {
  ARTICLE_LANGUAGE_OPTIONS,
  articleDate,
  articleLabel,
  formatMessageDate,
  preferredLanguage,
  type ArticleLanguage,
  type PublishedArticle,
} from "@/lib/article-public";
import { isPublicHttpUrl } from "@/lib/public-content";

export function ResourceArticle({
  article,
  initialLanguage,
}: {
  article: PublishedArticle;
  initialLanguage?: string | null;
}) {
  const [language, setLanguage] = useState<ArticleLanguage>(() =>
    preferredLanguage(article.locales, initialLanguage),
  );
  const locale =
    article.locales.find((item) => item.language === language) ??
    article.locales[0];
  const options = ARTICLE_LANGUAGE_OPTIONS.filter((option) =>
    article.locales.some((item) => item.language === option.value),
  );
  const meta = [locale?.verse ?? "", formatMessageDate(articleDate(article))]
    .filter((item) => item.length > 0)
    .join(" · ");
  const body = locale?.body.trim() ?? "";
  const videoLink = isPublicHttpUrl(article.videoLink ?? "")
    ? article.videoLink
    : null;
  const audioLink = isPublicHttpUrl(article.audioLink ?? "")
    ? article.audioLink
    : null;
  const showAside = Boolean(locale?.hasFile || videoLink || audioLink);
  const title = locale?.title ?? article.title;

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
        {options.length > 0 ? (
          <ChoiceGroup
            id="resource-language"
            label="Language"
            value={language}
            options={options}
            onChange={setLanguage}
          />
        ) : null}
        <h1 className="text-4xl leading-none font-extrabold tracking-tight lg:text-5xl">
          {title}
        </h1>
        {locale?.subtitle ? (
          <p className="text-lg leading-8 text-muted-foreground">
            {locale.subtitle}
          </p>
        ) : null}
        {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
      </header>

      <div
        className={cn(
          "grid items-start gap-8",
          showAside && "lg:grid-cols-[16rem_minmax(0,1fr)]",
        )}
      >
        {showAside ? (
          <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            {locale?.hasFile ? (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                  Download
                </h2>
                {locale.fileName ? (
                  <p className="text-sm text-muted-foreground">
                    {locale.fileName}
                  </p>
                ) : null}
                <a
                  href={`/resources/${article.id}/file?language=${language}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "self-start",
                  )}
                >
                  <DownloadIcon data-icon="inline-start" />
                  Download
                </a>
              </div>
            ) : null}
            {videoLink || audioLink ? (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                  Watch & listen
                </h2>
                {videoLink ? (
                  <a
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "self-start",
                    )}
                  >
                    <PlayIcon data-icon="inline-start" />
                    Watch
                  </a>
                ) : null}
                {audioLink ? (
                  <a
                    href={audioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "self-start",
                    )}
                  >
                    <HeadphonesIcon data-icon="inline-start" />
                    Listen
                  </a>
                ) : null}
              </div>
            ) : null}
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
