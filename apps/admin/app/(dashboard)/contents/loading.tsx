import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function ContentsLoading() {
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
              <Label>Sermon URL</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-9 w-16" />
          </CardContent>
        </Card>
        <Card className="h-full xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Series</CardTitle>
            <CardDescription>
              Names available when assigning an article to a series. Removing a
              series clears it from those articles.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Label>Series</Label>
            <Skeleton className="min-h-28 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
