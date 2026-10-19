import { PlayIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { TrueNorthMark } from "../components/logo";
import { PlanVisitButton } from "../components/plan-visit-modal";

export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden">
      <TrueNorthMark className="pointer-events-none absolute top-1/2 left-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-16 text-center lg:px-8 lg:py-20">
        <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
          Sundays | 10:00 AM & 5:00 PM
        </p>
        <h1 className="text-5xl uppercase leading-none font-extrabold tracking-tight whitespace-nowrap sm:text-5xl lg:text-6xl">
          Always pointing to Christ
        </h1>
        <p className="max-w-lg text-lg leading-8 text-muted-foreground">
          True North is a church family pointing each other to Jesus — through
          honest worship, the Word, and real community. Come as you are.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PlanVisitButton size="xl">Plan a visit</PlanVisitButton>
          <Button
            size="xl"
            variant="outline"
            nativeButton={false}
            // render={<Link href="/sermons" />}
          >
            <PlayIcon data-icon="inline-start" />
            Watch latest sermon
          </Button>
        </div>
      </div>
    </main>
  );
}
