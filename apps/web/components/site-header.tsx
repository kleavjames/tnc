"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { Logo } from "./logo";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  // { href: "/", label: "Home" },
  // { href: "/sermons", label: "Sermons" },
  // { href: "/about", label: "About" },
  // { href: "/events", label: "Events" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-card">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-xs font-semibold tracking-[0.18em] uppercase",
                  active
                    ? "border-b-2 border-foreground pb-1"
                    : "text-foreground/80 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/visit" />}
          >
            Plan a visit
          </Button>
        </nav>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" />
            }
          >
            <MenuIcon />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 px-4" aria-label="Mobile">
              {navItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-semibold tracking-[0.16em] uppercase",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Button
                nativeButton={false}
                size="xl"
                render={<Link href="/visit" />}
              >
                Plan a visit
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
