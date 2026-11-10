"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";
import type { SiteContent } from "@/lib/content";

const fieldClass =
  "border-input bg-white shadow-none focus-visible:border-ring";

export function ContentsForm({ content }: { content: SiteContent }) {
  const [latestSermon, setLatestSermon] = useState(content.latestSermon);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/content", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ latestSermon }),
      });
      if (!response.ok) {
        let detail = "Could not save the content.";
        try {
          const body = (await response.json()) as { message?: unknown };
          if (typeof body.message === "string") {
            detail = body.message;
          } else if (Array.isArray(body.message)) {
            detail = body.message.join(", ");
          }
        } catch {
          // status line only
        }
        throw new Error(detail);
      }
      const body = (await response.json()) as { latestSermon?: unknown };
      if (typeof body.latestSermon === "string") {
        setLatestSermon(body.latestSermon);
      }
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the content.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
          Content
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">Contents</h1>
        <p className="text-muted-foreground">
          Manage the contents of the church website.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Latest sermon
            </CardTitle>
            <CardDescription>
              Full URL for the home page “Watch latest sermon” button (YouTube,
              Vimeo, etc.).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="latest-sermon-url">Sermon URL</Label>
              <Input
                id="latest-sermon-url"
                value={latestSermon}
                placeholder="https://youtube.com/watch?v=..."
                onChange={(event) => {
                  setLatestSermon(event.target.value);
                  setSaved(false);
                }}
                className={cn("h-10", fieldClass)}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p className="text-sm text-muted-foreground">Saved.</p>
            ) : null}
            <Button type="button" disabled={saving} onClick={() => void save()}>
              Save
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
