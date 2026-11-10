"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGridIcon,
  ListIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { cn } from "@repo/ui/lib/utils";
import {
  ARTICLE_TYPE_LABELS,
  type Article,
  type ArticleType,
} from "../lib/articles";

type TypeFilter = "all" | ArticleType;
type ViewMode = "list" | "covers";

const sortItems = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Title A–Z", value: "title" },
];

function ResourceCover({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-md bg-muted",
        className,
      )}
    >
      <Image
        src="/tnc-logo-v2-transparent.png"
        alt=""
        width={80}
        height={80}
        className="size-1/2 object-contain"
      />
    </div>
  );
}

function formatUploaded(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function TypeBadge({ type }: { type: ArticleType }) {
  return <Badge variant="secondary">{ARTICLE_TYPE_LABELS[type]}</Badge>;
}

const STATUS_LABELS: Record<Article["articleStatus"], string> = {
  draft: "Draft",
  published: "Published",
  unpublish: "Unpublished",
};

function ResourceActions({ article }: { article: Article }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function onOpenChange(open: boolean) {
    if (deleting) {
      return;
    }
    setConfirmOpen(open);
    if (!open) {
      setError(null);
    }
  }

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/articles/${encodeURIComponent(article.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        setError("Could not delete this article. Please try again.");
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    } catch {
      setError("Could not delete this article. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Dialog open={confirmOpen} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden bg-background p-0 sm:max-w-md"
        >
          <DialogHeader className="flex-row items-center gap-4 bg-primary px-6 py-5 text-primary-foreground">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
              <Trash2Icon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <DialogTitle className="text-lg font-semibold">
                Delete article
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-3 px-6 py-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              You are about to permanently delete{" "}
              <span className="font-semibold text-foreground">
                “{article.title}”
              </span>
              . It will no longer be available to readers.
            </p>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter className="m-0 border-t-0 bg-background px-6 pt-0 pb-6">
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void remove()}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreHorizontalIcon />
          <span className="sr-only">Open actions for {article.title}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(`/resources/${article.id}`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function filterResources(
  articles: Article[],
  {
    type,
    query,
    series,
    sort,
  }: {
    type: TypeFilter;
    query: string;
    series: string;
    sort: string;
  },
) {
  const normalized = query.trim().toLowerCase();

  const filtered = articles.filter((article) => {
    const matchesType = type === "all" || article.type === type;
    const matchesSeries = series === "all" || article.series === series;
    const matchesQuery =
      normalized.length === 0 ||
      article.title.toLowerCase().includes(normalized) ||
      article.subtitle.toLowerCase().includes(normalized) ||
      article.verse.toLowerCase().includes(normalized);

    return matchesType && matchesSeries && matchesQuery;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }

    const aTime = Date.parse(a.uploadedAt);
    const bTime = Date.parse(b.uploadedAt);
    return sort === "oldest" ? aTime - bTime : bTime - aTime;
  });
}

export function ResourcesView({ articles }: { articles: Article[] }) {
  const [type, setType] = React.useState<TypeFilter>("all");
  const [view, setView] = React.useState<ViewMode>("list");
  const [query, setQuery] = React.useState("");
  const [series, setSeries] = React.useState("all");
  const [sort, setSort] = React.useState("newest");

  const typeTabs = [
    { value: "all" as const, label: "All", count: articles.length },
    ...(["glc", "lnl", "sermon"] as const).map((value) => ({
      value,
      label: ARTICLE_TYPE_LABELS[value],
      count: articles.filter((article) => article.type === value).length,
    })),
  ];
  const seriesNames = [
    ...new Set(
      articles.flatMap((article) => (article.series ? [article.series] : [])),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const seriesItems = [
    { label: "Series: All", value: "all" },
    ...seriesNames.map((name) => ({ label: name, value: name })),
  ];
  const visibleArticles = filterResources(articles, {
    type,
    query,
    series,
    sort,
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="max-w-md rounded-md">
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or scripture..."
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/resources/new" />}
        >
          <PlusIcon data-icon="inline-start" />
          New article
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Articles, Sermons, and more
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        </div>
        <ToggleGroup
          variant="outline"
          spacing={0}
          value={[view]}
          onValueChange={(value) => {
            if (value[0]) {
              setView(value[0] as ViewMode);
            }
          }}
        >
          <ToggleGroupItem value="list">
            <ListIcon data-icon="inline-start" />
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="covers">
            <LayoutGridIcon data-icon="inline-start" />
            Covers
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={type}
          onValueChange={(value) => setType(value as TypeFilter)}
        >
          <TabsList variant="line" className="gap-2">
            {typeTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <Badge variant="tertiary" className="text-[0.625rem]">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={seriesItems}
            value={series}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setSeries(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="end">
              <SelectGroup>
                {seriesItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            items={sortItems}
            value={sort}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setSort(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="end">
              <SelectGroup>
                {sortItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {visibleArticles.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {articles.length === 0
            ? "No articles yet."
            : "No articles match these filters."}
        </p>
      ) : view === "list" ? (
        <ResourcesTable articles={visibleArticles} />
      ) : (
        <ResourcesCoverGrid articles={visibleArticles} />
      )}

      <p className="text-sm text-muted-foreground">
        Showing {visibleArticles.length} of {articles.length} articles
      </p>
    </div>
  );
}

function ResourcesTable({ articles }: { articles: Article[] }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-muted-foreground font-bold">
              Title
            </TableHead>
            <TableHead className="text-muted-foreground font-bold">
              Series
            </TableHead>
            <TableHead className="text-muted-foreground font-bold">
              Type
            </TableHead>
            <TableHead className="text-muted-foreground font-bold">
              Status
            </TableHead>
            <TableHead className="text-muted-foreground font-bold">
              Date uploaded
            </TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <ResourceCover className="size-12 shrink-0" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">
                      {article.title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {article.verse}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{article.series ?? "No series"}</TableCell>
              <TableCell>
                <TypeBadge type={article.type} />
              </TableCell>
              <TableCell>{STATUS_LABELS[article.articleStatus]}</TableCell>
              <TableCell>{formatUploaded(article.uploadedAt)}</TableCell>
              <TableCell>
                <ResourceActions article={article} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ResourcesCoverGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {articles.map((article) => (
        <Card key={article.id}>
          <ResourceCover className="mx-4 aspect-[4/3]" />
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <CardTitle>{article.title}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {article.verse}
                </span>
              </div>
              <ResourceActions article={article} />
            </div>
            {article.subtitle ? (
              <CardDescription>{article.subtitle}</CardDescription>
            ) : null}
            <TypeBadge type={article.type} />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
