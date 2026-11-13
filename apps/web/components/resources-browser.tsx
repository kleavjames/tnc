"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, SearchIcon } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import {
  articleDate,
  articleLabel,
  ARTICLE_LANGUAGE_OPTIONS,
  formatCoverDate,
  formatMessageDate,
  preferredLanguage,
  type ArticleLanguage,
  type PublishedArticleSummary,
} from "@/lib/article-public";
import { ChoiceGroup } from "@repo/ui/choice-group";

const PAGE_SIZE = 6;

export function ResourcesBrowser({
  articles,
}: {
  articles: PublishedArticleSummary[];
}) {
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState("all");
  const [count, setCount] = useState(PAGE_SIZE);
  const seriesNames = [
    ...new Set(
      articles.flatMap((article) => (article.series ? [article.series] : [])),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const needle = query.trim().toLowerCase();
  const filtered = articles.filter((article) => {
    if (series !== "all" && article.series !== series) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return [
      article.series ?? "",
      ...article.locales.flatMap((locale) => [
        locale.title,
        locale.subtitle,
        locale.verse,
      ]),
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  const ordered = filtered.slice().sort(byLatestSermonDate);
  const visible = ordered.slice(0, count);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
            Resources
          </p>
          <h1 className="text-4xl leading-none font-extrabold tracking-tight uppercase lg:text-5xl">
            Messages and notes
          </h1>
        </div>
        <div className="relative w-full lg:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCount(PAGE_SIZE);
            }}
            placeholder="Search by title, verse, or series"
            aria-label="Search by title, verse, or series"
            className="h-10 bg-card pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Series">
        <SeriesPill
          label="All"
          pressed={series === "all"}
          onClick={() => {
            setSeries("all");
            setCount(PAGE_SIZE);
          }}
        />
        {seriesNames.map((name) => (
          <SeriesPill
            key={name}
            label={name}
            pressed={series === name}
            onClick={() => {
              setSeries(name);
              setCount(PAGE_SIZE);
            }}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">
          {articles.length === 0
            ? "No messages have been published yet."
            : "No messages match that search."}
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((article) => (
            <li key={article.id}>
              <ResourceCard article={article} />
            </li>
          ))}
        </ul>
      )}

      {count < ordered.length ? (
        <div className="flex justify-center">
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "uppercase tracking-[0.14em]",
            )}
            onClick={() => setCount((current) => current + PAGE_SIZE)}
          >
            Load more
          </button>
        </div>
      ) : null}
    </main>
  );
}

function byLatestSermonDate(
  a: PublishedArticleSummary,
  b: PublishedArticleSummary,
): number {
  const bySermonDate = Date.parse(articleDate(b)) - Date.parse(articleDate(a));
  if (bySermonDate !== 0) {
    return bySermonDate;
  }
  return Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt);
}

function SeriesPill({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium",
        pressed
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function ResourceCard({ article }: { article: PublishedArticleSummary }) {
  const [language, setLanguage] = useState<ArticleLanguage>(() =>
    preferredLanguage(article.locales),
  );
  const locale =
    article.locales.find((item) => item.language === language) ??
    article.locales[0];
  const sermonDate = formatMessageDate(articleDate(article));
  const meta = [locale?.verse ?? "", sermonDate]
    .filter((item) => item.length > 0)
    .join(" · ");
  const options = ARTICLE_LANGUAGE_OPTIONS.filter((option) =>
    article.locales.some((item) => item.language === option.value),
  );
  const title = locale?.title ?? article.title;

  return (
    <Card className="h-full gap-0 py-0">
      {article.hasImage ? (
        <img
          src={`/resources/${article.id}/cover`}
          alt=""
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex min-h-49 flex-col items-center justify-center gap-3 bg-muted px-6 py-10 text-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            {formatCoverDate(articleDate(article))}
          </p>
          <p className="text-2xl leading-tight font-extrabold tracking-tight text-balance uppercase">
            {title}
          </p>
        </div>
      )}
      {options.length > 0 ? (
        <div className="pt-2 pl-2">
          <ChoiceGroup
            className="gap-1"
            size="xs"
            id={`language-${article.id}`}
            label="Language"
            value={language}
            options={options}
            onChange={setLanguage}
          />
        </div>
      ) : null}
      <Link
        href={`/resources/${article.id}?language=${language}`}
        className="flex flex-1 flex-col"
      >
        <div className="flex flex-col gap-1 p-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {articleLabel(article)}
          </p>
          <h2 className="text-lg leading-snug font-semibold">{title}</h2>
          {meta ? (
            <p className="text-sm text-muted-foreground">{meta}</p>
          ) : null}
        </div>
      </Link>
      {locale?.hasFile ? (
        <div className="mt-auto flex items-center gap-3 border-t px-5 py-3">
          <a
            href={`/resources/${article.id}/file?language=${language}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            aria-label={`Download ${title}`}
          >
            <DownloadIcon data-icon="inline-start" />
            Download
          </a>
        </div>
      ) : null}
    </Card>
  );
}
