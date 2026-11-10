"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  ChevronRightIcon,
  DownloadIcon,
  LinkIcon,
  ListIcon,
  QuoteIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@repo/ui/lib/utils";
import { ChipInput } from "./chip-input";
import type { SeriesItem } from "../lib/series";
import {
  createDraft,
  createPublished,
  publishArticle,
  unpublishArticle,
  updateArticle,
  type ArticleContent,
} from "../lib/save-article";
import {
  deleteObject,
  describeObject,
  downloadObject,
  presignDownload,
  uploadFile,
} from "../lib/storage";

const STORAGE_KEY = "tnc.article-draft";
const MAX_FILE_BYTES = 200 * 1024 * 1024;
const EMPTY_BODY = "<p></p>";

const ARTICLE_TYPES = [
  { label: "GLC", value: "glc" },
  { label: "Life on Life", value: "lnl" },
  { label: "Sermon", value: "sermon" },
] as const;

const ARTICLE_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "Unpublished", value: "unpublish" },
  { label: "Published", value: "published" },
] as const;

type ArticleType = (typeof ARTICLE_TYPES)[number]["value"];
type ArticleStatus = (typeof ARTICLE_STATUSES)[number]["value"];

type ArticleFile = {
  id: string;
  name: string;
  size: number;
  loaded: number;
  contentType: string;
  key: string | null;
  error: string | null;
};

type ArticleDraft = {
  id: string | null;
  title: string;
  subtitle: string;
  bodyHtml: string;
  verse: string;
  tags: string[];
  type: ArticleType | null;
  articleStatus: ArticleStatus | null;
  sermonDate: string | null;
  imageKey: string | null;
  fileKey: string | null;
  videoLink: string;
  audioLink: string;
  fileName: string | null;
  fileSize: number;
  fileContentType: string | null;
  seriesId: string | null;
  savedAt: string;
};

const fieldClass =
  "border-input bg-white shadow-none focus-visible:border-ring";

const initialDraft: ArticleDraft = {
  id: null,
  title: "",
  subtitle: "",
  bodyHtml: "",
  verse: "",
  tags: [],
  type: null,
  articleStatus: null,
  sermonDate: null,
  imageKey: null,
  fileKey: null,
  videoLink: "",
  audioLink: "",
  fileName: null,
  fileSize: 0,
  fileContentType: null,
  seriesId: null,
  savedAt: new Date().toISOString(),
};

export type EditorArticle = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  verse: string;
  tags: string[];
  type: ArticleType | null;
  articleStatus: ArticleStatus | null;
  sermonDate: string | null;
  imageKey: string | null;
  fileKey: string | null;
  videoLink: string | null;
  audioLink: string | null;
  seriesId: string | null;
};

function draftFromArticle(article: EditorArticle): ArticleDraft {
  return {
    ...initialDraft,
    id: article.id,
    title: article.title,
    subtitle: article.subtitle,
    bodyHtml: article.body,
    verse: article.verse,
    tags: article.tags,
    type: article.type,
    articleStatus: article.articleStatus,
    sermonDate: article.sermonDate,
    imageKey: article.imageKey,
    fileKey: article.fileKey,
    videoLink: article.videoLink ?? "",
    audioLink: article.audioLink ?? "",
    seriesId: article.seriesId,
  };
}

function fileFromKey(key: string): ArticleFile {
  const name = key.split("/").pop() || "File";
  return {
    id: key,
    name,
    size: 0,
    loaded: 0,
    contentType: contentTypeFromName(name),
    key,
    error: null,
  };
}

function contentTypeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return "application/pdf";
  }
  if (/\.(mp3|m4a|wav)$/.test(lower)) {
    return "audio/mpeg";
  }
  return "application/octet-stream";
}

export function ArticleEditor({
  article,
  series = [],
}: {
  article?: EditorArticle;
  series?: SeriesItem[];
}) {
  const [draft, setDraft] = useState<ArticleDraft>(() =>
    article ? draftFromArticle(article) : initialDraft,
  );
  const [articleFile, setArticleFile] = useState<ArticleFile | null>(() =>
    article?.fileKey ? fileFromKey(article.fileKey) : null,
  );
  const [showSavedTime, setShowSavedTime] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [, setTick] = useState(0);
  const bodyHtmlRef = useRef(article?.body ?? "");
  const draftRef = useRef(draft);
  const fileRef = useRef<ArticleFile | null>(null);
  const uploads = useRef(new Map<string, AbortController>());
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  draftRef.current = draft;
  fileRef.current = articleFile;

  useEffect(() => {
    if (!article) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [article]);

  useEffect(() => {
    const key = article?.fileKey;
    if (!key) {
      return;
    }
    let cancel = false;
    void describeObject(key)
      .then((details) => {
        if (cancel) {
          return;
        }
        setArticleFile((current) => {
          if (current?.key !== key) {
            return current;
          }
          const contentType =
            details.contentType &&
            details.contentType !== "application/octet-stream"
              ? details.contentType
              : current.contentType;
          return {
            ...current,
            size: details.size,
            loaded: details.size,
            contentType,
          };
        });
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [article?.fileKey]);

  useEffect(() => {
    if (!draft.imageKey || coverPreview) {
      return;
    }
    let cancel = false;
    void presignDownload(draft.imageKey)
      .then((url) => {
        if (!cancel) {
          setCoverPreview(url);
        }
      })
      .catch(() => {
        if (!cancel) {
          setCoverError("Could not load the cover photo.");
        }
      });
    return () => {
      cancel = true;
    };
  }, [draft.imageKey, coverPreview]);

  useEffect(() => {
    setShowSavedTime(true);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const persist = useCallback((patch?: Partial<ArticleDraft>) => {
    const file = fileRef.current;
    const next: ArticleDraft = {
      ...draftRef.current,
      ...patch,
      bodyHtml: bodyHtmlRef.current,
      fileKey: file?.key ?? draftRef.current.fileKey,
      fileName: file?.name ?? draftRef.current.fileName,
      fileSize: file?.size ?? draftRef.current.fileSize,
      fileContentType: file?.contentType ?? draftRef.current.fileContentType,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDraft(next);
  }, []);

  function articleContent(current: ArticleDraft): ArticleContent | null {
    if (!current.type) {
      setSaveError("Choose a type.");
      return null;
    }
    if (!current.sermonDate) {
      setSaveError("Choose a sermon date.");
      return null;
    }
    return {
      title: current.title,
      subtitle: current.subtitle,
      body: bodyHtmlRef.current,
      verse: current.verse,
      tags: current.tags,
      type: current.type,
      sermonDate: current.sermonDate,
      imageKey: current.imageKey,
      fileKey: fileRef.current?.key ?? current.fileKey,
      videoLink: current.videoLink.trim() || null,
      audioLink: current.audioLink.trim() || null,
      seriesId:
        current.seriesId && current.seriesId !== "none"
          ? current.seriesId
          : null,
    };
  }

  async function runSave(
    action: () => Promise<{ id: string; articleStatus: ArticleStatus }>,
  ) {
    if (savingRef.current) {
      return;
    }
    const content = articleContent(draftRef.current);
    if (!content) {
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await action();
      persist({ id: saved.id, articleStatus: saved.articleStatus });
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save the article.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function saveDraft() {
    const current = draftRef.current;
    const content = articleContent(current);
    if (!content) {
      return;
    }
    return runSave(() =>
      current.id ? updateArticle(current.id, content) : createDraft(content),
    );
  }

  function publish() {
    const current = draftRef.current;
    const content = articleContent(current);
    if (!content) {
      return;
    }
    return runSave(() =>
      current.id
        ? publishArticle(current.id, content)
        : createPublished(content),
    );
  }

  function unpublish() {
    const id = draftRef.current.id;
    if (!id) {
      return;
    }
    return runSave(() => unpublishArticle(id));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => persist(), 800);
    return () => window.clearTimeout(timer);
  }, [
    persist,
    draft.title,
    draft.subtitle,
    draft.verse,
    draft.tags,
    draft.type,
    draft.sermonDate,
    draft.articleStatus,
    draft.imageKey,
    draft.fileKey,
    draft.videoLink,
    draft.audioLink,
    draft.seriesId,
  ]);

  function update<K extends keyof ArticleDraft>(
    key: K,
    value: ArticleDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const bodyTimer = useRef<number | null>(null);
  const onBodyChange = useCallback(
    (html: string) => {
      bodyHtmlRef.current = html;
      if (bodyTimer.current) {
        window.clearTimeout(bodyTimer.current);
      }
      bodyTimer.current = window.setTimeout(() => persist(), 800);
    },
    [persist],
  );

  async function onCoverFile(file: File | undefined) {
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setCoverError("Choose a photo for the cover.");
      return;
    }
    setCoverError(null);
    const preview = URL.createObjectURL(file);
    setCoverPreview((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return preview;
    });
    setCoverUploading(true);
    try {
      const previous = draftRef.current.imageKey;
      const uploaded = await uploadFile(file);
      if (previous && previous !== uploaded.key) {
        await deleteObject(previous).catch(() => undefined);
      }
      update("imageKey", uploaded.key);
    } catch (error) {
      setCoverError(
        error instanceof Error ? error.message : "Could not upload that photo.",
      );
    } finally {
      setCoverUploading(false);
    }
  }

  async function removeCover() {
    const key = draftRef.current.imageKey;
    setCoverError(null);
    if (key) {
      try {
        await deleteObject(key);
      } catch (error) {
        setCoverError(
          error instanceof Error
            ? error.message
            : "Could not delete that photo.",
        );
        return;
      }
    }
    setCoverPreview((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    update("imageKey", null);
  }

  async function onArticleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    setFileError(null);
    if (file.size > MAX_FILE_BYTES) {
      setFileError("Files need to be 200 MB or smaller.");
      return;
    }
    const previous = fileRef.current?.key ?? null;
    const id = crypto.randomUUID();
    const controller = new AbortController();
    uploads.current.set(id, controller);
    const nextFile: ArticleFile = {
      id,
      name: file.name,
      size: file.size,
      loaded: 0,
      contentType: file.type || "application/octet-stream",
      key: null,
      error: null,
    };
    fileRef.current = nextFile;
    setArticleFile(nextFile);
    try {
      const uploaded = await uploadFile(file, {
        signal: controller.signal,
        onProgress: (loaded, total) => {
          setArticleFile((current) =>
            current?.id === id ? { ...current, loaded, size: total } : current,
          );
        },
      });
      if (previous && previous !== uploaded.key) {
        await deleteObject(previous).catch(() => undefined);
      }
      const saved: ArticleFile = {
        ...nextFile,
        key: uploaded.key,
        loaded: file.size,
        error: null,
      };
      fileRef.current = saved;
      setArticleFile(saved);
      setDraft((current) => ({
        ...current,
        fileKey: uploaded.key,
        fileName: file.name,
        fileSize: file.size,
        fileContentType: saved.contentType,
      }));
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      const failed: ArticleFile = {
        ...nextFile,
        error:
          error instanceof Error
            ? error.message
            : "Could not upload that file.",
      };
      fileRef.current = failed;
      setArticleFile(failed);
    } finally {
      uploads.current.delete(id);
    }
  }

  async function removeFile() {
    const file = fileRef.current;
    if (!file) {
      return;
    }
    uploads.current.get(file.id)?.abort();
    setFileError(null);
    if (file.key) {
      try {
        await deleteObject(file.key);
      } catch (error) {
        setFileError(
          error instanceof Error
            ? error.message
            : "Could not delete that file.",
        );
        return;
      }
    }
    fileRef.current = null;
    setArticleFile(null);
    setDraft((current) => ({
      ...current,
      fileKey: null,
      fileName: null,
      fileSize: 0,
      fileContentType: null,
    }));
  }

  async function downloadFile() {
    const file = fileRef.current;
    if (!file?.key) {
      return;
    }
    setFileError(null);
    try {
      await downloadObject(file.key);
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : "Could not download that file.",
      );
    }
  }

  const seriesItems = [
    { label: "No series", value: "none" },
    ...series.map((item) => ({ label: item.title, value: item.id })),
  ];
  const statusLabel = ARTICLE_STATUSES.find(
    (item) => item.value === draft.articleStatus,
  )?.label;

  return (
    <div className="flex flex-1 flex-col bg-card [--editor-bg:color-mix(in_oklab,var(--background)_45%,white)]">
      <style>{articleBodyCss}</style>
      <header className="sticky top-0 z-10 flex flex-col gap-3 bg-card/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link
            href="/resources"
            className="text-muted-foreground hover:text-foreground"
          >
            Articles
          </Link>
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          <span className="font-medium">
            {article ? "Edit article" : "New article"}
          </span>
          <span className="text-muted-foreground">
            {statusLabel ? `${statusLabel} · ` : null}
            saved {showSavedTime ? relativeTime(draft.savedAt) : "just now"}
          </span>
          {saveError ? (
            <span className="text-destructive" role="alert">
              {saveError}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="bg-card"
            disabled={saving}
            onClick={() => void saveDraft()}
          >
            {draft.articleStatus === "published" ? "Save" : "Save as draft"}
          </Button>
          <Button
            type="button"
            className="px-4 font-semibold tracking-wide uppercase"
            disabled={saving || draft.articleStatus === "published"}
            onClick={() => void publish()}
          >
            Publish
          </Button>
          {draft.articleStatus === "published" ? (
            <Button
              type="button"
              variant="outline"
              className="bg-card"
              disabled={saving}
              onClick={() => void unpublish()}
            >
              Unpublish
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid items-start gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="rounded-md bg-(--editor-bg)">
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="article-title">Title</Label>
                <input
                  id="article-title"
                  value={draft.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="Article title"
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-2xl font-bold tracking-tight outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-3xl"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="article-subtitle">Subtitle</Label>
                <input
                  id="article-subtitle"
                  value={draft.subtitle}
                  onChange={(event) => update("subtitle", event.target.value)}
                  placeholder="Short line under the title"
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Body</Label>
                <ArticleBody
                  initialHtml={article?.body || EMPTY_BODY}
                  editable
                  onChange={onBodyChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md bg-(--editor-bg)">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Watch & listen
              </CardTitle>
              <CardDescription>
                Embed the service recording so members can stream it on the
                sermon page.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="article-video-link">Video link</Label>
                <Input
                  id="article-video-link"
                  value={draft.videoLink}
                  placeholder="https://youtube.com/live/tn-dec28"
                  onChange={(event) => update("videoLink", event.target.value)}
                  className={cn("h-10", fieldClass)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="article-audio-link">
                  Podcast / audio link{" "}
                  <span className="font-normal text-muted-foreground">
                    optional
                  </span>
                </Label>
                <Input
                  id="article-audio-link"
                  value={draft.audioLink}
                  placeholder="Spotify or Apple Podcasts URL"
                  onChange={(event) => update("audioLink", event.target.value)}
                  className={cn("h-10", fieldClass)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-5">
          <Card className="rounded-md bg-(--editor-bg)">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Cover</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-input bg-muted/40">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <p className="px-6 text-center text-sm text-muted-foreground">
                    No cover image
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Cover image"
                  className="sr-only"
                  onChange={(event) => {
                    void onCoverFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={coverUploading}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {draft.imageKey ? "Replace image" : "Upload image"}
                </Button>
                {draft.imageKey ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={coverUploading}
                    onClick={() => void removeCover()}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {coverUploading
                  ? "Uploading cover photo..."
                  : "Stored as the article image."}
              </p>
              {coverError ? (
                <p className="text-sm text-destructive" role="alert">
                  {coverError}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-md bg-(--editor-bg)">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Type</Label>
                <Select
                  items={ARTICLE_TYPES.map((item) => ({ ...item }))}
                  value={draft.type}
                  onValueChange={(value) => {
                    if (isArticleType(value)) {
                      update("type", value);
                    }
                  }}
                >
                  <SelectTrigger className={cn("h-10 w-full", fieldClass)}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ARTICLE_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="article-verse">Verse</Label>
                <Input
                  id="article-verse"
                  value={draft.verse}
                  placeholder="Matthew 28:20"
                  onChange={(event) => update("verse", event.target.value)}
                  className={cn("h-10", fieldClass)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Sermon date</Label>
                <SermonDatePicker
                  value={draft.sermonDate}
                  onChange={(sermonDate) => update("sermonDate", sermonDate)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="article-tag">Tags</Label>
                <ChipInput
                  id="article-tag"
                  values={draft.tags}
                  placeholder="Add a tag"
                  onAdd={(tag) =>
                    setDraft((current) => ({
                      ...current,
                      tags: current.tags.includes(tag)
                        ? current.tags
                        : [...current.tags, tag],
                    }))
                  }
                  onRemove={(tag) =>
                    setDraft((current) => ({
                      ...current,
                      tags: current.tags.filter((item) => item !== tag),
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Series</Label>
                <Select
                  items={seriesItems}
                  value={draft.seriesId ?? "none"}
                  onValueChange={(value) => {
                    if (typeof value !== "string") {
                      return;
                    }
                    update("seriesId", value === "none" ? null : value);
                  }}
                >
                  <SelectTrigger className={cn("h-10 w-full", fieldClass)}>
                    <SelectValue placeholder="Select series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {seriesItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select
                  items={ARTICLE_STATUSES.map((item) => ({ ...item }))}
                  value={draft.articleStatus}
                  onValueChange={(value) => {
                    if (isArticleStatus(value)) {
                      update("articleStatus", value);
                    }
                  }}
                >
                  <SelectTrigger className={cn("h-10 w-full", fieldClass)}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ARTICLE_STATUSES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md bg-(--editor-bg)">
            <CardHeader>
              <CardTitle className="text-base font-semibold">File</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {articleFile ? (
                <FileRow
                  file={articleFile}
                  onDownload={() => void downloadFile()}
                  onRemove={() => void removeFile()}
                />
              ) : null}
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed px-4 py-6 text-center",
                  dragging
                    ? "border-primary bg-muted/60"
                    : "border-input bg-muted/40",
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void onArticleFile(event.dataTransfer.files[0]);
                }}
              >
                <UploadIcon className="size-4 text-primary" />
                <span className="text-sm font-medium">
                  {articleFile ? "Replace file or " : "Drop a file or "}
                  <span className="text-primary underline">browse</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Notes, slides, audio, or a study guide · up to 200 MB
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={(event) => {
                    void onArticleFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              {fileError ? (
                <p className="text-sm text-destructive" role="alert">
                  {fileError}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ArticleBody({
  initialHtml,
  editable,
  onChange,
}: {
  initialHtml: string;
  editable: boolean;
  onChange: (html: string) => void;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    content: initialHtml,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        link: { openOnClick: false },
      }),
    ],
    editorProps: {
      attributes: {
        class: "article-body min-h-48 text-[15px] leading-relaxed outline-none",
        "aria-label": "Article body",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isEditable === editable) {
      return;
    }
    editor.setEditable(editable);
  }, [editor, editable]);

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      if (!current) {
        return null;
      }
      return {
        heading: current.isActive("heading", { level: 2 }),
        bold: current.isActive("bold"),
        italic: current.isActive("italic"),
        underline: current.isActive("underline"),
        list: current.isActive("bulletList"),
        quote: current.isActive("blockquote"),
        link: current.isActive("link"),
      };
    },
  });

  function run(command: () => boolean | void) {
    if (!editor) {
      return;
    }
    command();
    onChange(editor.getHTML());
  }

  return (
    <div className="overflow-hidden rounded-md border border-input bg-white focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      {editable ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-input bg-(--editor-bg) p-1">
          <select
            aria-label="Paragraph style"
            className="h-8 rounded-md border border-input bg-white px-2 text-sm outline-none"
            value={active?.heading ? "h2" : "p"}
            disabled={!editor}
            onChange={(event) => {
              const next = event.target.value;
              run(() => {
                const chain = editor?.chain().focus();
                if (!chain) {
                  return;
                }
                if (next === "h2") {
                  chain.setHeading({ level: 2 }).run();
                  return;
                }
                chain.setParagraph().run();
              });
            }}
          >
            <option value="p">Paragraph</option>
            <option value="h2">Heading</option>
          </select>
          <ToolbarButton
            label="Bold"
            active={active?.bold}
            onClick={() =>
              run(() => editor?.chain().focus().toggleBold().run())
            }
          >
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={active?.italic}
            onClick={() =>
              run(() => editor?.chain().focus().toggleItalic().run())
            }
          >
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={active?.underline}
            onClick={() =>
              run(() => editor?.chain().focus().toggleUnderline().run())
            }
          >
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            active={active?.heading}
            onClick={() =>
              run(() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run(),
              )
            }
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            label="Bulleted list"
            active={active?.list}
            onClick={() =>
              run(() => editor?.chain().focus().toggleBulletList().run())
            }
          >
            <ListIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={active?.quote}
            onClick={() =>
              run(() => editor?.chain().focus().toggleBlockquote().run())
            }
          >
            <QuoteIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Link"
            active={active?.link}
            onClick={() => {
              if (!editor) {
                return;
              }
              const previous = editor.getAttributes("link").href;
              const href = window.prompt("Link URL", previous || "https://");
              if (href === null) {
                return;
              }
              run(() => {
                if (href === "") {
                  editor.chain().focus().unsetLink().run();
                  return;
                }
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href })
                  .run();
              });
            }}
          >
            <LinkIcon />
          </ToolbarButton>
        </div>
      ) : null}
      <div className="px-3 py-2">
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div
            className="article-body min-h-48 text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: initialHtml }}
          />
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      aria-pressed={active}
      className={cn("min-w-8 px-2", active && "bg-muted")}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function FileRow({
  file,
  onDownload,
  onRemove,
}: {
  file: ArticleFile;
  onDownload: () => void;
  onRemove: () => void;
}) {
  const uploading = file.key === null && !file.error;
  const progress =
    file.size > 0
      ? Math.min(100, Math.round((file.loaded / file.size) * 100))
      : 0;

  return (
    <div className="flex items-start gap-3 rounded-md border border-input bg-muted/40 px-3 py-2.5">
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md text-[0.6rem] font-bold",
          fileKind(file) === "PDF"
            ? "bg-primary text-primary-foreground"
            : "bg-background text-muted-foreground",
        )}
      >
        {fileKind(file)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {file.error
            ? file.error
            : uploading
              ? `Uploading · ${formatBytes(file.loaded)} of ${formatBytes(file.size)}`
              : formatBytes(file.size)}
        </p>
        {uploading ? (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>
      {file.key ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Download ${file.name}`}
          onClick={onDownload}
        >
          <DownloadIcon />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
      >
        <XIcon />
      </Button>
    </div>
  );
}

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

function fileKind(file: ArticleFile): string {
  const name = file.name.toLowerCase();
  if (file.contentType.includes("pdf") || name.endsWith(".pdf")) {
    return "PDF";
  }
  if (file.contentType.startsWith("audio") || /\.(mp3|m4a|wav)$/.test(name)) {
    return "MP3";
  }
  return "FILE";
}

function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }
  const mb = size / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

function SermonDatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? sermonDateFromDay(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            data-empty={!value}
            className={cn(
              "h-10 w-full justify-start font-normal data-[empty=true]:text-muted-foreground",
              fieldClass,
            )}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {value ? formatSermonDate(value) : "Pick a date"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? sermonDayFromDate(date) : null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function sermonDateFromDay(value: string): Date {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return new Date(year, month - 1, day);
}

function sermonDayFromDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatSermonDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(sermonDateFromDay(value));
}

function isArticleType(value: unknown): value is ArticleType {
  return ARTICLE_TYPES.some((item) => item.value === value);
}

function isArticleStatus(value: unknown): value is ArticleStatus {
  return ARTICLE_STATUSES.some((item) => item.value === value);
}

const articleBodyCss = `
.article-body p { margin: 0.85rem 0; }
.article-body > p:only-child:has(> br.ProseMirror-trailingBreak:only-child)::before {
  content: "Write the article";
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--muted-foreground);
}
.article-body h2 { margin: 1.2rem 0 0.35rem; font-size: 1.125rem; font-weight: 700; }
.article-body ul { margin: 0.75rem 0; padding-left: 1.25rem; list-style: disc; }
.article-body a { color: var(--primary); text-decoration: underline; }
.article-body blockquote {
  margin: 1rem 0;
  border-radius: 0.5rem;
  background: color-mix(in oklab, var(--muted) 30%, white);
  padding: 0.95rem 1rem;
}
.article-body blockquote p { margin: 0; font-style: italic; }
.article-body blockquote p + p {
  margin-top: 0.55rem;
  font-style: normal;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--primary);
}
`;
