import type { Metadata } from "next";
import { cn } from "@repo/ui/lib/utils";
import { montserrat } from "@repo/ui/fonts/montserrat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Membership | True North Church",
  description: "Register as a member of True North Church.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full font-sans antialiased", montserrat.variable)}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
