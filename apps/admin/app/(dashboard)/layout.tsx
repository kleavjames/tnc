import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { SessionWatcher } from "../../components/session-watcher";
import { readSession } from "../../lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await readSession();
  if (result.status === "anonymous") {
    redirect("/");
  }
  if (result.status === "expired") {
    redirect("/api/auth/logout");
  }
  if (result.status === "unavailable") {
    throw new Error("Could not verify the session.");
  }

  return (
    <SidebarProvider>
      <SessionWatcher expiresAt={result.session.expiresAt} />
      <AppSidebar />
      <SidebarInset className="bg-card">
        <header className="flex h-12 items-center gap-2 px-4 md:hidden">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
