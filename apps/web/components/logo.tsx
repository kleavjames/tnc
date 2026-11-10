import Image from "next/image";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

const LOGO_SRC = "/tnc-logo-v2-transparent.png";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="True North Church"
      className={cn("inline-flex shrink-0 items-center gap-2.5", className)}
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={44}
        height={44}
        className="size-20 object-contain"
        priority
      />
    </Link>
  );
}

export function TrueNorthMark({ className }: { className?: string }) {
  return (
    <Image
      src={LOGO_SRC}
      alt=""
      aria-hidden
      width={448}
      height={448}
      className={cn("object-contain opacity-[0.08]", className)}
    />
  );
}
