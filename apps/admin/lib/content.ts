import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

export type SiteContent = {
  latestSermon: string;
};

export async function getContent(): Promise<SiteContent> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }

  const response = await fetch(`${apiBaseUrl()}/content`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (!response.ok) {
    throw new Error("Could not load site content.");
  }

  const body = (await response.json()) as { latestSermon?: unknown };
  return {
    latestSermon:
      typeof body.latestSermon === "string" ? body.latestSermon : "",
  };
}
