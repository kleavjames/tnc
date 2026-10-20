"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  FolderIcon,
  LayoutDashboardIcon,
  LayersIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@repo/ui/components/sidebar";
import { cn } from "@repo/ui/lib/utils";
import { BrandMark } from "./brand-mark";

function sidebarNavItemClassName(isActive: boolean) {
  return cn(
    "rounded-md px-2 py-2.5 transition-colors",
    isActive
      ? "bg-sidebar-primary text-sidebar-primary-foreground"
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );
}

const sidebarNavButtonClassName =
  "h-8 min-h-8 items-center bg-transparent p-0 shadow-none hover:bg-transparent active:bg-transparent data-active:bg-transparent data-active:font-medium data-active:text-inherit hover:text-inherit";

const sidebarProfileButtonClassName =
  "h-auto min-h-0 items-center gap-2.5 bg-transparent p-0 shadow-none hover:bg-transparent active:bg-transparent hover:text-inherit";

const contentItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Resources", href: "/resources", icon: FileTextIcon },
  { title: "Series", href: "/series", icon: LayersIcon },
  { title: "Speakers", href: "/speakers", icon: UserIcon },
  { title: "Media library", href: "/media", icon: FolderIcon },
] as const;

const churchItems = [
  { title: "Settings", href: "/settings", icon: SparklesIcon },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <Link href="/articles" className="px-2 py-1.5">
          <BrandMark />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-1">
              {contentItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem
                    key={item.href}
                    className={sidebarNavItemClassName(isActive)}
                  >
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                      className={sidebarNavButtonClassName}
                    >
                      <item.icon />
                      <span className="font-semibold">{item.title}</span>
                    </SidebarMenuButton>
                    {"badge" in item ? (
                      <SidebarMenuBadge className="top-1/2! -translate-y-1/2! right-2 bg-sidebar-accent text-sidebar-accent-foreground">
                        {item?.badge as React.ReactNode}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Church</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-1">
              {churchItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem
                    key={item.href}
                    className={sidebarNavItemClassName(isActive)}
                  >
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                      className={sidebarNavButtonClassName}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu className="px-1">
          <SidebarMenuItem className={sidebarNavItemClassName(false)}>
            <SidebarMenuButton className={sidebarProfileButtonClassName}>
              <Avatar className="shrink-0">
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col justify-center gap-0.5 leading-none">
                <span className="truncate text-sm font-medium">
                  Maria Santos
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Media team
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
