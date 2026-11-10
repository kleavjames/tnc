"use client";

import * as React from "react";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  deleteObject,
  downloadObject,
  listObjects,
  uploadFile,
  type StoredObject,
} from "../lib/storage";

export function MediaLibrary() {
  const [objects, setObjects] = React.useState<StoredObject[]>([]);
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listObjects();
      setObjects(result.objects);
    } catch {
      setError("Could not load files.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);
    try {
      await uploadFile(file);
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      await refresh();
    } catch {
      setError("Could not upload that file.");
    } finally {
      setUploading(false);
    }
  }

  async function onDownload(key: string) {
    setError(null);
    try {
      await downloadObject(key);
    } catch {
      setError("Could not download that file.");
    }
  }

  async function onDelete(key: string) {
    setError(null);
    try {
      await deleteObject(key);
      await refresh();
    } catch {
      setError("Could not delete that file.");
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
          Content
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Media library</h1>
        <p className="max-w-lg text-muted-foreground">
          Store sermon audio, notes, and downloadable files in one place.
        </p>
      </div>

      <form
        onSubmit={onUpload}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          ref={inputRef}
          type="file"
          aria-label="File to upload"
          className="text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <Button type="submit" disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground font-bold">
                File
              </TableHead>
              <TableHead className="text-muted-foreground font-bold">
                Size
              </TableHead>
              <TableHead className="text-muted-foreground font-bold">
                Uploaded
              </TableHead>
              <TableHead className="w-40">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objects.map((object) => (
              <TableRow key={object.key}>
                <TableCell className="max-w-xs truncate font-medium">
                  {fileName(object.key)}
                </TableCell>
                <TableCell>{formatBytes(object.size)}</TableCell>
                <TableCell>{formatDate(object.lastModified)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void onDownload(object.key)}
                    >
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void onDelete(object.key)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {objects.length === 0 && loading
              ? Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-56" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {objects.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No files yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function fileName(key: string): string {
  return key.split("/").pop() || key;
}

function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
