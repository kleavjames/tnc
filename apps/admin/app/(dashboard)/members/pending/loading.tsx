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

export default function PendingMembersLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div>
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Content
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Pending registrations
        </h1>
        <p className="max-w-lg text-muted-foreground">
          Review people who registered and have not been approved yet.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="font-bold text-muted-foreground">
                Mobile
              </TableHead>
              <TableHead className="font-bold text-muted-foreground">
                Branch
              </TableHead>
              <TableHead className="font-bold text-muted-foreground">
                Registered
              </TableHead>
              <TableHead className="text-right font-bold text-muted-foreground">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: ROW_COUNT }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
