import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function ResourceLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:px-8 lg:py-16">
      <Link
        href="/resources"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
      >
        <ArrowLeftIcon className="size-4" />
        Resources
      </Link>

      <header className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full max-w-xl lg:h-12" />
        <Skeleton className="h-6 w-full max-w-md" />
        <Skeleton className="h-4 w-48" />
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-32" />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
