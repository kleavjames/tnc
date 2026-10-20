import Image from "next/image";
import { cn } from "@repo/ui/lib/utils";

const LOGO_SRC = "/tnc-logo-v2-transparent.png";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-2.5", className)}
      aria-label="True North Church"
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={48}
        height={48}
        className="size-10 object-contain"
        priority
      />
      <div className="flex flex-col leading-none">
        <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase">
          True
        </span>
        <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase">
          North
        </span>
        <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase">
          Church
        </span>
      </div>
    </div>
  );
}
