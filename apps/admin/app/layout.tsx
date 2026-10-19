import type { Metadata } from "next";
import { cn } from "@repo/ui/lib/utils";
import { montserrat } from "@repo/ui/fonts/montserrat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign in | True North Church",
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
        {children}
      </body>
    </html>
  );
}
