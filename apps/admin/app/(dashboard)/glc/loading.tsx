import { Card, CardContent } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

const ROW_COUNT = 6;
const SESSION_COUNT = 8;

export default function GLCLoading() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 bg-background p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            GLC
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Global Leadership Center
          </h1>
          <p className="text-sm text-muted-foreground">
            This is the general overview of the leader's progress in the Global
            Leadership Center.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatSkeleton label="Members" />
          <StatSkeleton label="Avg. progress" />
          <StatSkeleton label="Completed" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterSkeleton label="Level" pills={["w-24", "w-16", "w-16", "w-16"]} />
        <FilterSkeleton label="Branch" pills={["w-14", "w-24", "w-24"]} />
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <Table className="border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                colSpan={2}
                className="sticky left-0 z-30 w-88 min-w-88 border-r border-b border-foreground bg-foreground text-background"
              >
                <span className="text-xs font-bold tracking-[0.16em] uppercase">
                  Curriculum
                </span>
              </TableHead>
              <TableHead
                colSpan={4}
                className="border-r border-b border-foreground/80 bg-foreground"
              >
                <Skeleton className="mx-auto h-4 w-16 bg-background/30" />
              </TableHead>
              <TableHead
                colSpan={4}
                className="border-b border-foreground/80 bg-foreground"
              >
                <Skeleton className="mx-auto h-4 w-16 bg-background/30" />
              </TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableHead
                colSpan={2}
                className="sticky left-0 z-30 h-auto w-88 min-w-88 border-r border-b bg-primary/15 py-2"
              >
                <Skeleton className="h-8 w-full" />
              </TableHead>
              <TableHead colSpan={4} className="border-r border-b bg-primary/15">
                <Skeleton className="mx-auto h-4 w-16" />
              </TableHead>
              <TableHead colSpan={4} className="border-b bg-primary/15">
                <Skeleton className="mx-auto h-4 w-16" />
              </TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-20 w-56 min-w-56 border-b bg-card text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Member
              </TableHead>
              <TableHead className="sticky left-56 z-20 w-32 min-w-32 border-r border-b bg-card text-xs font-bold tracking-wide text-muted-foreground uppercase shadow-[4px_0_8px_-6px_rgba(0,0,0,0.28)]">
                Progress
              </TableHead>
              {Array.from({ length: SESSION_COUNT }, (_, index) => (
                <TableHead
                  key={index}
                  className="min-w-16 border-b px-1 text-center"
                >
                  <Skeleton className="mx-auto h-7 w-10" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: ROW_COUNT }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="sticky left-0 z-10 w-56 min-w-56 bg-card">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="sticky left-56 z-10 w-32 min-w-32 border-r bg-card shadow-[4px_0_8px_-6px_rgba(0,0,0,0.28)]">
                  <div className="flex min-w-24 flex-col gap-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </TableCell>
                {Array.from({ length: SESSION_COUNT }, (_, session) => (
                  <TableCell key={session} className="text-center">
                    <Skeleton className="mx-auto size-4 rounded-[4px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <Skeleton className="h-5 w-56" />
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="size-3.5 rounded-[4px] bg-primary" />
            Done
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3.5 rounded-[4px] border border-input bg-card" />
            Not yet
          </span>
        </div>
      </div>
    </div>
  );
}

function StatSkeleton({ label }: { label: string }) {
  return (
    <Card size="sm" className="min-w-28">
      <CardContent className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
        <Skeleton className="h-9 w-12" />
      </CardContent>
    </Card>
  );
}

function FilterSkeleton({
  label,
  pills,
}: {
  label: string;
  pills: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {pills.map((width, index) => (
          <Skeleton
            key={`${label}-${index}`}
            className={`h-8 rounded-full ${width}`}
          />
        ))}
      </div>
    </div>
  );
}
