import type { Metadata } from "next";
import { cn } from "@repo/ui/lib/utils";
import { montserrat } from "@repo/ui/fonts/montserrat";
import { PlanVisitModalProvider } from "../components/plan-visit-modal";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "True North Church",
    template: "%s | True North Church",
  },
  description:
    "True North is a church family pointing each other to Jesus — through honest worship, the Word, and real community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans antialiased", montserrat.variable)}>
      <body className="flex min-h-svh flex-col">
        <PlanVisitModalProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </PlanVisitModalProvider>
      </body>
    </html>
  );
}
