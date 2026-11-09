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

const navItems: NavItem[] = [
  // { href: "/", label: "Home" },
  // { href: "/sermons", label: "Sermons" },
  // { href: "/about", label: "About" },
  // { href: "/events", label: "Events" },
];

const aboutItems: NavItem[] = [
  { href: "/about/who-we-are", label: "Who We Are" },
  { href: "/about/statement-of-faith", label: "Statement of Faith" },
  { href: "/about/tnc-communities", label: "TNC Communities" },
];

const triggerClass = "text-xs font-semibold tracking-[0.18em] uppercase";

export function SiteHeader() {
  const pathname = usePathname();
  const aboutActive = pathname.startsWith("/about");

  return (
    <header className="bg-card">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-4 lg:flex">
          <NavigationMenu aria-label="Primary">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    active={pathname === item.href}
                    className={cn(navigationMenuTriggerStyle(), triggerClass)}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(triggerClass, aboutActive && "bg-muted/50")}
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
            </NavigationMenuList>
          </NavigationMenu>
          <PlanVisitButton size="lg">Plan a visit</PlanVisitButton>
        </div>

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
