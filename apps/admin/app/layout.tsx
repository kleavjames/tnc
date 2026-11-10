import type { Metadata } from "next";
import { cn } from "@repo/ui/lib/utils";
import { montserrat } from "@repo/ui/fonts/montserrat";
import "./globals.css";
import { TooltipProvider } from "@repo/ui/components/tooltip";

export const metadata: Metadata = {
  title: {
    default: "Admin | True North Church",
    template: "%s | True North Church",
  },
  description:
    "Sign in to the True North Church admin portal to manage sermons and articles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full font-sans antialiased", montserrat.variable)}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
