import type { Metadata } from "next";
import Image from "next/image";
import { BrandMark } from "../components/brand-mark";
import { SignInForm } from "../components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

const LOGO_SRC = "/tnc-logo-v2-transparent.png";
const FEATURES = ["Sermons", "Notes", "Audio", "Downloads"] as const;

export default function Home() {
  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <section className="relative hidden flex-col overflow-hidden bg-background p-10 lg:flex lg:p-14">
        <Image
          src={LOGO_SRC}
          alt=""
          aria-hidden
          width={448}
          height={448}
          className="pointer-events-none absolute -right-10 -bottom-16 size-112 object-contain opacity-[0.08]"
        />

        <BrandMark />

        <div className="relative flex flex-1 flex-col justify-center py-16">
          <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
            Sunday | Every week
          </p>
          <p className="mt-4 text-5xl leading-[0.9] font-extrabold tracking-tight uppercase xl:text-6xl">
            Share
            <br />
            the word,
            <br />
            every
            <br />
            week.
          </p>
          <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground">
            Publish sermons, notes and recordings so the church family can
            listen, read and download — wherever they are.
          </p>
        </div>

        <ul className="relative flex gap-6 text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {FEATURES.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col items-center justify-center bg-card px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <BrandMark className="lg:hidden" />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Admin portal
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Use your ministry team account to manage sermons and articles.
            </p>
          </div>

          <SignInForm />
        </div>
      </section>
    </div>
  );
}
