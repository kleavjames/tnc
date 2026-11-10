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

export default function MembersLoading() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-10 w-full max-w-md flex-1" />
        <Skeleton className="h-10 w-48 shrink-0" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
          Church directory
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
      </div>

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
                Registered
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
                  <Skeleton className="h-4 w-24" />
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
