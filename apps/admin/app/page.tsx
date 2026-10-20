import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { MailIcon } from "lucide-react";
import { Button, buttonVariants } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import { Marker, MarkerContent } from "@repo/ui/components/marker";
import { BrandMark } from "../components/brand-mark";

export const metadata: Metadata = {
  title: "Sign in",
};

const LOGO_SRC = "/tnc-logo-v2-transparent.png";
const FEATURES = ["Sermons", "Notes", "Audio", "Downloads"] as const;

async function signIn(_formData: FormData) {
  "use server";
  redirect("/articles");
}

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
          className="pointer-events-none absolute -right-10 -bottom-16 size-[28rem] object-contain opacity-[0.08]"
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

          <form action={signIn} className="flex flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-10"
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between gap-4">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#forgot-password"
                    className={cn(
                      buttonVariants({ variant: "link", size: "xs" }),
                      "h-auto px-0",
                    )}
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-10"
                />
              </Field>

              <Field orientation="horizontal">
                <Checkbox id="remember" name="remember" defaultChecked />
                <FieldLabel htmlFor="remember" className="font-normal">
                  Keep me signed in on this device
                </FieldLabel>
              </Field>
            </FieldGroup>

            <Button type="submit" size="xl" className="w-full">
              SIGN IN
            </Button>

            <Marker variant="separator">
              <MarkerContent>or</MarkerContent>
            </Marker>

            <Button
              type="button"
              variant="outline"
              size="xl"
              className="w-full"
            >
              <MailIcon data-icon="inline-start" />
              Email me a sign-in link
            </Button>

            <FieldDescription>
              Not on the ministry team? Sermons are available to everyone at{" "}
              <a href="https://truenorth.church/sermons">
                truenorth.church/sermons
              </a>
            </FieldDescription>
          </form>
        </div>
      </section>
    </div>
  );
}
