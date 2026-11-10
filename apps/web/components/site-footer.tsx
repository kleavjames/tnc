import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/tnc-logo-v1-transparent.png";

const CAMPUSES = [
  { time: "10:00 AM & 5:00 PM", place: "Davao City, Davao del Sur" },
  { time: "9:30 AM", place: "Kapalong, Davao del Norte" },
  { time: "9:30 AM", place: "Tagum, Davao del Norte" },
] as const;

function FooterBrand() {
  return (
    <Link
      href="/"
      aria-label="True North Church"
      className="inline-flex shrink-0 items-center gap-3"
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={44}
        height={44}
        className="size-20 object-contain"
      />
      <div className="flex flex-col relative -left-2.5">
        <span className="text-xs font-bold tracking-[0.14em] text-footer-foreground uppercase">
          True
        </span>
        <span className="text-xs font-bold tracking-[0.14em] text-footer-foreground uppercase">
          North
        </span>
        <span className="text-xs font-bold tracking-[0.14em] text-footer-foreground uppercase">
          Church
        </span>
      </div>
    </Link>
  );
}

function FooterInfo({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[0.65rem] font-medium tracking-[0.16em] text-footer-muted uppercase">
        {label}
      </p>
      <div className="text-sm text-footer-foreground">{children}</div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <FooterBrand />
        <div className="flex flex-col gap-5 sm:hidden">
          {CAMPUSES.map((campus) => (
            <div key={campus.place} className="flex flex-col gap-0.5">
              <p className="text-sm text-footer-foreground">{campus.place}</p>
              <p className="text-sm text-footer-muted">{campus.time}</p>
            </div>
          ))}
        </div>
        <div className="hidden sm:flex sm:items-start sm:gap-14">
          <FooterInfo label="Sunday Service">
            <div>
              {CAMPUSES.map((campus) => (
                <span key={campus.place} className="block">
                  {campus.time}
                </span>
              ))}
            </div>
          </FooterInfo>
          <FooterInfo label="Address">
            <div>
              {CAMPUSES.map((campus) => (
                <span key={campus.place} className="block">
                  {campus.place}
                </span>
              ))}
            </div>
          </FooterInfo>
        </div>
      </div>
    </footer>
  );
}
