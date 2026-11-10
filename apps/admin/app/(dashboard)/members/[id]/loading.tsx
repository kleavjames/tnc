import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

const MEETING_ROW_COUNT = 2;

export default function MemberLoading() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8">
      <div>
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="flex max-w-5xl flex-col gap-10">
        <header className="flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-32" />
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <Section
            title="Personal"
            fields={[
              ["First name", "w-28"],
              ["Last name", "w-32"],
              ["Birthdate", "w-28"],
              ["Gender", "w-16"],
              ["Civil status", "w-20"],
            ]}
          />
          <Section
            title="Contact"
            fields={[
              ["Mobile", "w-32"],
              ["Email", "w-48"],
              ["Messenger", "w-36"],
            ]}
          />
        </div>

        <Section
          title="Church"
          fields={[
            ["Branch", "w-44"],
            ["Dgroup leader", "w-10"],
            ["Roles", "w-20"],
            ["Registered", "w-28"],
          ]}
        />

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight">Dgroup meetings</h2>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="font-bold text-muted-foreground">
                    Days
                  </TableHead>
                  <TableHead className="font-bold text-muted-foreground">
                    Time
                  </TableHead>
                  <TableHead className="font-bold text-muted-foreground">
                    Description
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: MEETING_ROW_COUNT }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({
  title,
  fields,
}: {
  title: string;
  fields: [label: string, width: string][];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <dl className="flex flex-col border-t">
        {fields.map(([label, width]) => (
          <div
            key={label}
            className="grid gap-1 border-b py-3 sm:grid-cols-[9rem_1fr] sm:gap-4"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="flex h-6 items-center">
              <Skeleton className={`h-4 ${width}`} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
