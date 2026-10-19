import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/tnc-logo-v2-transparent.png";

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
        width={40}
        height={40}
        className="size-10 object-contain"
      />
      <span className="text-sm font-bold tracking-[0.14em] text-footer-foreground uppercase">
        True North Church
      </span>
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
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-14">
          <FooterInfo label="Sunday service">10:00 AM & 5:00 PM</FooterInfo>
          <FooterInfo label="Address">
            <div>
              <span>Door 6&7, Camfer Building</span>
              <br />
              <span>154 Bonifacio St, Poblacion District</span>
              <br />
              <span>Davao City, 8000 Davao del Sur</span>
            </div>
          </FooterInfo>
        </div>
      </div>
    </footer>
  );
}
