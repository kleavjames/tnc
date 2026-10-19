import type { Metadata } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import { cn } from "@repo/ui/lib/utils";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-heading",
});

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
    <html
      lang="en"
      className={cn("font-sans", sourceSans.variable, oswald.variable)}
    >
      <body className="flex min-h-svh flex-col antialiased">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
