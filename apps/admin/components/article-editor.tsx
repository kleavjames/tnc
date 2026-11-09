"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpenIcon,
  ChevronRightIcon,
  DownloadIcon,
  LinkIcon,
  ListIcon,
  QuoteIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@repo/ui/lib/utils";
import { ARTICLE_SERIES } from "../lib/articles";
import {
  deleteObject,
  downloadObject,
  presignDownload,
  uploadFile,
} from "../lib/storage";

const STORAGE_KEY = "tnc.article-draft";
const MAX_FILE_BYTES = 200 * 1024 * 1024;

const SPEAKERS = [
  { name: "Ptr. Daniel Reyes", initials: "DR" },
  { name: "Ptr. Grace Lim", initials: "GL" },
  { name: "Bro. Mark Tan", initials: "MT" },
] as const;

const VISIBILITY = [
  { label: "Public", value: "Public" },
  { label: "Unlisted", value: "Unlisted" },
  { label: "Private", value: "Private" },
] as const;

const DEFAULT_BODY = `<p>Christmas week has a way of filling every room — and then emptying it just as quickly. The guests go home, the decorations come down, and the quiet can feel heavier than before.</p><blockquote><p>“And surely I am with you always, to the very end of the age.”</p><p>Matthew 28:20</p></blockquote><h2>1. He stays when the season changes</h2><p>Emmanuel was never a holiday name. It is a promise for ordinary Tuesdays, for hospital waiting rooms, for the first Monday back at work</p>`;

type CoverMode = "generated" | "background" | "custom";
type ArticleStatus = "draft" | "published";

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
  title: string;
  subtitle: string;
  bodyHtml: string;
  videoUrl: string;
  podcastUrl: string;
  speaker: string;
  serviceDate: string;
  series: string;
  scriptures: string[];
  membersCanDownload: boolean;
  visibility: string;
  publishAt: string;
  slug: string;
  slugTouched: boolean;
  status: ArticleStatus;
  coverMode: CoverMode;
  coverKey: string | null;
  files: Array<Omit<ArticleFile, "loaded" | "error">>;
  savedAt: string;
};

const initialSavedAt = new Date(Date.now() - 2 * 60 * 1000).toISOString();

const initialDraft: ArticleDraft = {
  title: "The God Who Stays",
  subtitle:
    "When the season ends and the lights come down, His presence remains.",
  bodyHtml: DEFAULT_BODY,
  videoUrl: "https://youtube.com/live/tn-dec28",
  podcastUrl: "",
  speaker: "Ptr. Daniel Reyes",
  serviceDate: "2025-12-28",
  series: "Emmanuel",
  scriptures: ["Matthew 28:20", "Isaiah 7:14"],
  membersCanDownload: true,
  visibility: "Public",
  publishAt: "2025-12-28T14:00",
  slug: "the-god-who-stays",
  slugTouched: false,
  status: "draft",
  coverMode: "generated",
  coverKey: null,
  files: [],
  savedAt: initialSavedAt,
};

export function ArticleEditor() {
  const [draft, setDraft] = React.useState<ArticleDraft>(initialDraft);
  const [files, setFiles] = React.useState<ArticleFile[]>([]);
  const [scriptureDraft, setScriptureDraft] = React.useState("");
  const [preview, setPreview] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [showSavedTime, setShowSavedTime] = React.useState(false);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [coverError, setCoverError] = React.useState<string | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [initialHtml, setInitialHtml] = React.useState(DEFAULT_BODY);
  const [, setTick] = React.useState(0);
  const bodyHtmlRef = React.useRef(DEFAULT_BODY);
  const draftRef = React.useRef(draft);
  const filesRef = React.useRef(files);
  const uploads = React.useRef(new Map<string, AbortController>());
  const backgroundInputRef = React.useRef<HTMLInputElement>(null);
  const customInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  draftRef.current = draft;
  filesRef.current = files;

  React.useLayoutEffect(() => {
    const stored = readDraft();
    const html = stored?.bodyHtml || DEFAULT_BODY;
    bodyHtmlRef.current = html;
    setInitialHtml(html);
    if (stored) {
      setDraft(stored);
      setFiles(
        stored.files.map((file) => ({
          ...file,
          loaded: file.size,
          error: null,
        })),
      );
    }
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!draft.coverKey || coverPreview) {
      return;
    }
    let cancel = false;
    void presignDownload(draft.coverKey)
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
  }, [draft.coverKey, coverPreview]);

  React.useEffect(() => {
    setShowSavedTime(true);
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const persist = React.useCallback((patch?: Partial<ArticleDraft>) => {
    const next: ArticleDraft = {
      ...draftRef.current,
      ...patch,
      bodyHtml: bodyHtmlRef.current,
      files: filesRef.current.flatMap((file) =>
        file.key
          ? [
              {
                id: file.id,
                name: file.name,
                size: file.size,
                contentType: file.contentType,
                key: file.key,
              },
            ]
          : [],
      ),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDraft((current) => ({
      ...current,
      ...patch,
      savedAt: next.savedAt,
    }));
  }, []);

  React.useEffect(() => {
    if (!ready) {
      return;
    }
    const timer = window.setTimeout(() => persist(), 800);
    return () => window.clearTimeout(timer);
  }, [
    ready,
    persist,
    draft.title,
    draft.subtitle,
    draft.videoUrl,
    draft.podcastUrl,
    draft.speaker,
    draft.serviceDate,
    draft.series,
    draft.scriptures,
    draft.membersCanDownload,
    draft.visibility,
    draft.publishAt,
    draft.slug,
    draft.slugTouched,
    draft.status,
    draft.coverMode,
    draft.coverKey,
    files,
  ]);

  function update<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function onTitleChange(value: string) {
    setDraft((current) => ({
      ...current,
      title: value,
      slug: current.slugTouched ? current.slug : slugify(value),
    }));
  }

  const bodyTimer = React.useRef<number | null>(null);
  const onBodyChange = React.useCallback(
    (html: string) => {
      bodyHtmlRef.current = html;
      if (bodyTimer.current) {
        window.clearTimeout(bodyTimer.current);
      }
      bodyTimer.current = window.setTimeout(() => persist(), 800);
    },
    [persist],
  );

  function addScripture() {
    const next = scriptureDraft.trim();
    if (!next) {
      return;
    }
    setScriptureDraft("");
    setDraft((current) => ({
      ...current,
      scriptures: current.scriptures.includes(next)
        ? current.scriptures
        : [...current.scriptures, next],
    }));
  }

  async function onCoverFile(file: File | undefined, mode: CoverMode) {
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
    update("coverMode", mode);
    setCoverUploading(true);
    try {
      const uploaded = await uploadFile(file);
      update("coverKey", uploaded.key);
    } catch (error) {
      setCoverError(
        error instanceof Error ? error.message : "Could not upload that photo.",
      );
    } finally {
      setCoverUploading(false);
    }
  }

  async function addFiles(list: FileList | File[]) {
    setFileError(null);
    const incoming = Array.from(list);
    const tooLarge = incoming.find((file) => file.size > MAX_FILE_BYTES);
    if (tooLarge) {
      setFileError("Files need to be 200 MB or smaller.");
    }
    for (const file of incoming) {
      if (file.size > MAX_FILE_BYTES) {
        continue;
      }
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
      setFiles((current) => [...current, nextFile]);
      try {
        const uploaded = await uploadFile(file, {
          signal: controller.signal,
          onProgress: (loaded, total) => {
            setFiles((current) =>
              current.map((item) =>
                item.id === id ? { ...item, loaded, size: total } : item,
              ),
            );
          },
        });
        setFiles((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, key: uploaded.key, loaded: file.size, error: null }
              : item,
          ),
        );
      } catch (error) {
        if (controller.signal.aborted) {
          setFiles((current) => current.filter((item) => item.id !== id));
          continue;
        }
        setFiles((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Could not upload that file.",
                }
              : item,
          ),
        );
      } finally {
        uploads.current.delete(id);
      }
    }
  }

  async function removeFile(file: ArticleFile) {
    uploads.current.get(file.id)?.abort();
    setFileError(null);
    if (file.key) {
      try {
        await deleteObject(file.key);
      } catch (error) {
        setFileError(
          error instanceof Error ? error.message : "Could not delete that file.",
        );
        return;
      }
    }
    setFiles((current) => current.filter((item) => item.id !== file.id));
  }

  async function downloadFile(file: ArticleFile) {
    if (!file.key) {
      return;
    }
    setFileError(null);
    try {
      await downloadObject(file.key);
    } catch (error) {
      setFileError(
        error instanceof Error ? error.message : "Could not download that file.",
      );
    }
  }

  const speaker =
    SPEAKERS.find((item) => item.name === draft.speaker) ?? SPEAKERS[0];
  const seriesItems = ARTICLE_SERIES.map((series) => ({
    label: series,
    value: series,
  }));

  return (
    <div className="flex flex-1 flex-col bg-background">
      <style>{articleBodyCss}</style>
      <header className="sticky top-0 z-10 flex flex-col gap-3 bg-background/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link
            href="/resources"
            className="text-muted-foreground hover:text-foreground"
          >
            Articles
          </Link>
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          <span className="font-medium">New article</span>
          <span className="text-muted-foreground">
            {draft.status === "published" ? "Published" : "Draft"} · saved{" "}
            {showSavedTime ? relativeTime(draft.savedAt) : "just now"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="bg-card"
            onClick={() => setPreview((current) => !current)}
          >
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-card"
            onClick={() => persist({ status: "draft" })}
          >
            Save draft
          </Button>
          <Button
            type="button"
            className="px-4 font-semibold tracking-wide uppercase"
            onClick={() => persist({ status: "published" })}
          >
            Publish
          </Button>
        </div>
      </header>

      <div className="grid items-start gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-5">
          <Card className="shadow-sm">
            <CardContent className="flex flex-col gap-4">
              <p className="text-[0.7rem] font-bold tracking-[0.16em] text-primary uppercase">
                {serviceEyebrow(draft.serviceDate)}
              </p>
              <input
                value={draft.title}
                onChange={(event) => onTitleChange(event.target.value)}
                readOnly={preview}
                aria-label="Title"
                className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none md:text-4xl"
              />
              <input
                value={draft.subtitle}
                onChange={(event) => update("subtitle", event.target.value)}
                readOnly={preview}
                aria-label="Subtitle"
                className="w-full bg-transparent text-sm text-muted-foreground outline-none"
              />
              {ready ? (
                <ArticleBody
                  initialHtml={initialHtml}
                  editable={!preview}
                  onChange={onBodyChange}
                />
              ) : (
                <div className="min-h-48" />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Watch & listen
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Embed the service recording so members can stream it on the
                sermon page.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="video-link">Video link</Label>
                  <Input
                    id="video-link"
                    value={draft.videoUrl}
                    readOnly={preview}
                    placeholder="https://youtube.com/..."
                    onChange={(event) => update("videoUrl", event.target.value)}
                    className="h-10 bg-card"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="podcast-link">
                    Podcast / audio link{" "}
                    <span className="font-normal text-muted-foreground">
                      optional
                    </span>
                  </Label>
                  <Input
                    id="podcast-link"
                    value={draft.podcastUrl}
                    readOnly={preview}
                    placeholder="Spotify or Apple Podcasts URL"
                    onChange={(event) =>
                      update("podcastUrl", event.target.value)
                    }
                    className="h-10 bg-card"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-5">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Cover</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg bg-muted px-6 text-center">
                {coverPreview && draft.coverMode !== "generated" ? (
                  <img
                    src={coverPreview}
                    alt=""
                    className={cn(
                      "absolute inset-0 size-full object-cover",
                      draft.coverMode === "background" && "opacity-45",
                    )}
                  />
                ) : null}
                {draft.coverMode === "custom" && coverPreview ? null : (
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <p className="text-[0.65rem] font-bold tracking-[0.14em] text-primary uppercase">
                      {serviceEyebrow(draft.serviceDate)}
                    </p>
                    <p className="max-w-[12rem] text-3xl leading-[0.95] font-bold tracking-tight uppercase">
                      {draft.title || "Untitled"}
                    </p>
                  </div>
                )}
                <Image
                  src="/tnc-logo-v2-transparent.png"
                  alt=""
                  width={56}
                  height={56}
                  className="absolute bottom-4 left-4 z-10 size-12 object-contain"
                />
              </div>
              {preview ? null : (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Background photo"
                    className="sr-only"
                    onChange={(event) => {
                      void onCoverFile(
                        event.target.files?.[0],
                        "background",
                      );
                      event.target.value = "";
                    }}
                  />
                  <input
                    ref={customInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Custom cover"
                    className="sr-only"
                    onChange={(event) => {
                      void onCoverFile(event.target.files?.[0], "custom");
                      event.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={coverUploading}
                    onClick={() => backgroundInputRef.current?.click()}
                  >
                    Add background photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={coverUploading}
                    onClick={() => customInputRef.current?.click()}
                  >
                    Upload custom
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {coverUploading
                  ? "Uploading cover photo..."
                  : "Generated from the title and service date in the True North style."}
              </p>
              {coverError ? (
                <p className="text-sm text-destructive" role="alert">
                  {coverError}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Speaker</Label>
                <Select
                  items={SPEAKERS.map((item) => ({
                    label: item.name,
                    value: item.name,
                  }))}
                  value={draft.speaker}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      update("speaker", value);
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full" disabled={preview}>
                    <span className="flex items-center gap-2">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary text-[0.65rem] text-primary-foreground">
                          {speaker.initials}
                        </AvatarFallback>
                      </Avatar>
                      <SelectValue />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SPEAKERS.map((item) => (
                        <SelectItem key={item.name} value={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="service-date">Service date</Label>
                  <label className="relative">
                    <span className="flex h-10 items-center rounded-md border border-input px-2.5 text-sm">
                      {serviceDateLabel(draft.serviceDate)}
                    </span>
                    <input
                      id="service-date"
                      type="date"
                      value={draft.serviceDate}
                      readOnly={preview}
                      onChange={(event) =>
                        update("serviceDate", event.target.value)
                      }
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Series</Label>
                  <Select
                    items={seriesItems}
                    value={draft.series}
                    onValueChange={(value) => {
                      if (typeof value === "string") {
                        update("series", value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 w-full" disabled={preview}>
                      <SelectValue />
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
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="scripture-add">Scripture</Label>
                <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5">
                  {draft.scriptures.map((reference) => (
                    <span
                      key={reference}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
                    >
                      {reference}
                      {preview ? null : (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Remove ${reference}`}
                          onClick={() =>
                            update(
                              "scriptures",
                              draft.scriptures.filter(
                                (item) => item !== reference,
                              ),
                            )
                          }
                        >
                          <XIcon className="size-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {preview ? null : (
                    <input
                      id="scripture-add"
                      value={scriptureDraft}
                      onChange={(event) => setScriptureDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addScripture();
                        }
                      }}
                      onBlur={addScripture}
                      placeholder="Add..."
                      className="h-6 min-w-16 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Downloads</CardTitle>
              <CardAction>
                <Label className="text-xs font-normal text-muted-foreground">
                  Members can download
                  <Switch
                    checked={draft.membersCanDownload}
                    disabled={preview}
                    onCheckedChange={(checked) =>
                      update("membersCanDownload", checked)
                    }
                    aria-label="Members can download"
                  />
                </Label>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onDownload={() => void downloadFile(file)}
                  onRemove={() => void removeFile(file)}
                />
              ))}
              {preview ? null : (
                <label
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed px-4 py-6 text-center",
                    dragging
                      ? "border-primary bg-muted/60"
                      : "border-border bg-card",
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    void addFiles(event.dataTransfer.files);
                  }}
                >
                  <UploadIcon className="size-4 text-primary" />
                  <span className="text-sm font-medium">
                    Drop files or{" "}
                    <span className="text-primary underline">browse</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Notes, slides, audio, study guides · up to 200 MB
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      if (event.target.files) {
                        void addFiles(event.target.files);
                      }
                      event.target.value = "";
                    }}
                  />
                </label>
              )}
              {fileError ? (
                <p className="text-sm text-destructive" role="alert">
                  {fileError}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Visibility</span>
                <Select
                  items={VISIBILITY.map((item) => ({ ...item }))}
                  value={draft.visibility}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      update("visibility", value);
                    }
                  }}
                >
                  <SelectTrigger
                    className="h-8 w-auto border-0 bg-transparent shadow-none"
                    disabled={preview}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectGroup>
                      {VISIBILITY.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Publish</span>
                <span className="relative font-medium">
                  {publishLabel(draft.publishAt)}
                  <input
                    type="datetime-local"
                    value={draft.publishAt}
                    readOnly={preview}
                    aria-label="Publish time"
                    onChange={(event) => update("publishAt", event.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </span>
              </label>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Page URL</span>
                <span className="flex min-w-0 items-center justify-end text-primary">
                  <span>/sermons/</span>
                  <input
                    aria-label="Page URL"
                    value={draft.slug}
                    readOnly={preview}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        slugTouched: true,
                        slug: sanitizeSlug(event.target.value),
                      }))
                    }
                    className="w-36 min-w-0 bg-transparent text-right outline-none"
                  />
                </span>
              </div>
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
  const onChangeRef = React.useRef(onChange);
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
        class:
          "article-body min-h-48 text-[15px] leading-relaxed outline-none",
        "aria-label": "Article body",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.getHTML());
    },
  });

  React.useEffect(() => {
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
    <>
      {editable ? (
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted/50 p-1">
          <select
            aria-label="Paragraph style"
            className="h-8 rounded-md bg-transparent px-2 text-sm outline-none"
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
            onClick={() => run(() => editor?.chain().focus().toggleBold().run())}
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto bg-card"
            disabled={!editor}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              run(() =>
                editor
                  ?.chain()
                  .focus()
                  .insertContent(
                    "<blockquote><p>“Verse text”</p><p>Book 0:0</p></blockquote><p></p>",
                  )
                  .run(),
              )
            }
          >
            <BookOpenIcon data-icon="inline-start" />
            Insert verse
          </Button>
        </div>
      ) : null}
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div
          className="article-body min-h-48 text-[15px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: initialHtml }}
        />
      )}
    </>
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
      className={cn("min-w-8 px-2", active && "bg-card")}
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
    file.size > 0 ? Math.min(100, Math.round((file.loaded / file.size) * 100)) : 0;

  return (
    <div className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md text-[0.6rem] font-bold",
          fileKind(file) === "PDF"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
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
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
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

function serviceDateLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "Set a date";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function serviceEyebrow(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "Service date";
  }
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const rest = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${weekday} | ${rest}`;
}

function publishLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Set a time";
  }
  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
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

function slugify(value: string): string {
  return sanitizeSlug(value).replace(/-+$/g, "") || "untitled";
}

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-/, "");
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

function readDraft(): ArticleDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<ArticleDraft>;
    if (typeof parsed.title !== "string" || !Array.isArray(parsed.scriptures)) {
      return null;
    }
    return {
      ...initialDraft,
      ...parsed,
      scriptures: parsed.scriptures.filter(
        (item): item is string => typeof item === "string",
      ),
      files: Array.isArray(parsed.files)
        ? parsed.files.flatMap((file) => {
            if (
              !file ||
              typeof file !== "object" ||
              typeof file.id !== "string" ||
              typeof file.name !== "string" ||
              typeof file.key !== "string"
            ) {
              return [];
            }
            return [
              {
                id: file.id,
                name: file.name,
                size: typeof file.size === "number" ? file.size : 0,
                contentType:
                  typeof file.contentType === "string"
                    ? file.contentType
                    : "application/octet-stream",
                key: file.key,
              },
            ];
          })
        : [],
    };
  } catch {
    return null;
  }
}

const articleBodyCss = `
.article-body p { margin: 0.85rem 0; }
.article-body h2 { margin: 1.2rem 0 0.35rem; font-size: 1.125rem; font-weight: 700; }
.article-body ul { margin: 0.75rem 0; padding-left: 1.25rem; list-style: disc; }
.article-body a { color: var(--primary); text-decoration: underline; }
.article-body blockquote {
  margin: 1rem 0;
  border-radius: 0.75rem;
  background: color-mix(in oklch, var(--muted) 70%, white);
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
