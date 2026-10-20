"use client";

import * as React from "react";
import {
  LayoutGridIcon,
  ListIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@repo/ui/components/pagination";
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
  ARTICLES,
  ARTICLE_SERIES,
  ARTICLE_TYPE_COUNTS,
  ARTICLE_TYPE_LABELS,
  type Article,
  type ArticleType,
} from "../lib/articles";

type TypeFilter = "all" | ArticleType;
type ViewMode = "list" | "covers";

const typeTabs: Array<{ value: TypeFilter; label: string; count: number }> = [
  { value: "all", label: "All", count: ARTICLE_TYPE_COUNTS.all },
  { value: "glc", label: ARTICLE_TYPE_LABELS.glc, count: ARTICLE_TYPE_COUNTS.glc },
  {
    value: "life-on-life",
    label: ARTICLE_TYPE_LABELS["life-on-life"],
    count: ARTICLE_TYPE_COUNTS["life-on-life"],
  },
  {
    value: "sermons",
    label: ARTICLE_TYPE_LABELS.sermons,
    count: ARTICLE_TYPE_COUNTS.sermons,
  },
];

const seriesItems = [
  { label: "Series: All", value: "all" },
  ...ARTICLE_SERIES.map((series) => ({ label: series, value: series })),
];

const sortItems = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Title A–Z", value: "title" },
];

function ResourceCover({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end overflow-hidden rounded-md bg-muted p-1.5",
        className,
      )}
    >
      <span className="line-clamp-3 text-[0.55rem] leading-tight font-bold tracking-wide text-foreground/80 uppercase">
        {title}
      </span>
    </div>
  );
}

function TypeBadge({ type }: { type: ArticleType }) {
  return <Badge variant="secondary">{ARTICLE_TYPE_LABELS[type]}</Badge>;
}

function ResourceActions({ title }: { title: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <MoreHorizontalIcon />
        <span className="sr-only">Open actions for {title}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
      article.speaker.toLowerCase().includes(normalized) ||
      article.scripture.toLowerCase().includes(normalized);

    return matchesType && matchesSeries && matchesQuery;
  });

  if (sort === "newest") {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }

    const aTime = Date.parse(a.dateUploaded);
    const bTime = Date.parse(b.dateUploaded);
    return aTime - bTime;
  });
}

export function ResourcesView() {
  const [type, setType] = React.useState<TypeFilter>("all");
  const [view, setView] = React.useState<ViewMode>("list");
  const [query, setQuery] = React.useState("");
  const [series, setSeries] = React.useState("all");
  const [sort, setSort] = React.useState("newest");

  const articles = filterResources(ARTICLES, { type, query, series, sort });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="max-w-md rounded-md">
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sermons, speakers, scripture..."
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Button size="lg">
          <PlusIcon data-icon="inline-start" />
          New article
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Sermons & articles
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
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
          <TabsList variant="line">
            {typeTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <Badge variant="secondary">{tab.count}</Badge>
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

      {view === "list" ? (
        <ResourcesTable articles={articles} />
      ) : (
        <ResourcesCoverGrid articles={articles} />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {articles.length} of {ARTICLE_TYPE_COUNTS.all} articles
        </p>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
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
                  <ResourceCover
                    title={article.title}
                    className="size-12 shrink-0"
                  />
                  <span className="truncate font-medium">{article.title}</span>
                </div>
              </TableCell>
              <TableCell>{article.series}</TableCell>
              <TableCell>
                <TypeBadge type={article.type} />
              </TableCell>
              <TableCell>{article.dateUploaded}</TableCell>
              <TableCell>
                <ResourceActions title={article.title} />
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
          <ResourceCover title={article.title} className="mx-4 aspect-[4/3]" />
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle>{article.title}</CardTitle>
              <ResourceActions title={article.title} />
            </div>
            <CardDescription>
              {article.scripture} · {article.speaker}
            </CardDescription>
            <TypeBadge type={article.type} />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
