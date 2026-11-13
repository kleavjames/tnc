import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

const ROW_COUNT = 8;

const FILTERS = [
  { label: "Branch", pills: ["w-14", "w-24", "w-24"] },
  { label: "Gender", pills: ["w-14", "w-16", "w-20"] },
  { label: "Dgroup leader", pills: ["w-14", "w-14", "w-14"] },
  {
    label: "Civil status",
    pills: ["w-14", "w-16", "w-20", "w-20", "w-24"],
  },
] as const;

export default function MembersLoading() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Church directory
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        </div>
        <Button
          size="lg"
          className="shrink-0"
          nativeButton={false}
          render={<Link href="/members/pending" />}
        >
          Pending registrations
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full max-w-sm rounded-md" />
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {FILTERS.map((filter) => (
              <div key={filter.label} className="flex min-w-0 flex-col gap-2">
                <p className="text-sm font-medium">{filter.label}</p>
                <div className="flex flex-wrap gap-2">
                  {filter.pills.map((width, index) => (
                    <Skeleton
                      key={`${filter.label}-${index}`}
                      className={`h-8 rounded-full ${width}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="min-w-0 overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-muted-foreground">
                Membership ID
              </TableHead>
              <TableHead className="font-bold text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="font-bold text-muted-foreground">
                Mobile
              </TableHead>
              <TableHead className="font-bold text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="font-bold text-muted-foreground">
                Branch
              </TableHead>
              <TableHead className="font-bold text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: ROW_COUNT }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-44" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Skeleton className="h-5 w-48" />
    </div>
  );
}
