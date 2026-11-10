import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ChevronRightIcon } from "lucide-react";

const cardClass = "rounded-md bg-[color-mix(in_oklab,var(--background)_45%,white)]";

function Field({ label, height = "h-10" }: { label: string; height?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Skeleton className={`${height} w-full`} />
    </div>
  );
}

export default function EditArticleLoading() {
  return (
    <div className="flex flex-1 flex-col bg-card">
      <header className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-muted-foreground">Articles</span>
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          <span className="font-medium">Edit article</span>
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </header>

      <div className="grid items-start gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className={cardClass}>
            <CardContent className="flex flex-col gap-4">
              <Field label="Title" height="h-14" />
              <Field label="Subtitle" height="h-10" />
              <Field label="Body" height="h-72" />
            </CardContent>
          </Card>

          <Card className={cardClass}>
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
              <Field label="Video link" />
              <Field label="Podcast / audio link" />
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-5">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Cover</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Type" />
              <Field label="Verse" />
              <Field label="Sermon date" />
              <Field label="Tags" />
              <Field label="Series" />
              <Field label="Status" />
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">File</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
