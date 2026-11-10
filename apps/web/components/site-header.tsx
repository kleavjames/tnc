"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { Logo } from "./logo";
import { PlanVisitButton } from "./plan-visit-modal";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [{ href: "/resources", label: "Resources" }];

function itemActive(pathname: string, href: string) {
  if (href === "/resources") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}

const aboutItems: NavItem[] = [
  { href: "/about/who-we-are", label: "Who We Are" },
  { href: "/about/statement-of-faith", label: "Statement of Faith" },
  { href: "/about/tnc-communities", label: "TNC Communities" },
];

const triggerClass =
  "text-xs font-semibold tracking-[0.18em] text-primary-foreground uppercase hover:bg-primary-foreground/10 focus:bg-primary-foreground/10 data-popup-open:bg-primary-foreground/15 data-popup-open:hover:bg-primary-foreground/15 data-open:bg-primary-foreground/15 data-open:hover:bg-primary-foreground/15 data-open:focus:bg-primary-foreground/15";

export function SiteHeader() {
  const pathname = usePathname();
  const aboutActive = pathname.startsWith("/about");

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Logo className="[&_img]:brightness-0 [&_img]:invert" />

        <div className="hidden items-center gap-4 lg:flex">
          <NavigationMenu aria-label="Primary">
            <NavigationMenuList className="gap-4">
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    triggerClass,
                    aboutActive && "bg-primary-foreground/15",
                  )}
                >
                  About
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex w-56 flex-col gap-1">
                    {aboutItems.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink
                          render={<Link href={item.href} />}
                          active={pathname === item.href}
                          closeOnClick
                        >
                          {item.label}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    active={itemActive(pathname, item.href)}
                    className={cn(navigationMenuTriggerStyle(), triggerClass)}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <PlanVisitButton size="lg" variant="secondary">
            Plan a visit
          </PlanVisitButton>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden"
              />
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
                const active = itemActive(pathname, item.href);

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
              <div className="flex flex-col gap-3">
                <span
                  className={cn(
                    "text-sm font-semibold tracking-[0.16em] uppercase",
                    aboutActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  About
                </span>
                <div className="flex flex-col gap-3 border-l pl-4">
                  {aboutItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-sm",
                        pathname === item.href
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <PlanVisitButton size="xl">Plan a visit</PlanVisitButton>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
