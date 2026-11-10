import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

const CARD_COUNT = 6;

export default function ResourcesLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
            Resources
          </p>
          <h1 className="text-4xl leading-none font-extrabold tracking-tight uppercase lg:text-5xl">
            Messages and notes
          </h1>
        </div>
        <Skeleton className="h-10 w-full lg:max-w-sm" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-14 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: CARD_COUNT }, (_, index) => (
          <li key={index}>
            <Card className="h-full gap-0 py-0">
              <Skeleton className="min-h-52 rounded-b-none" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="mt-auto flex items-center gap-3 border-t pt-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="ml-auto h-5 w-14" />
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
