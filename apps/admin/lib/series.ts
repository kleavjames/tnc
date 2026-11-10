import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

export type SeriesItem = {
  id: string;
  title: string;
};

export async function getSeries(): Promise<SeriesItem[]> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }

  const response = await fetch(`${apiBaseUrl()}/series`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (!response.ok) {
    throw new Error("Could not load series.");
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error("Could not load series.");
  }

  return body.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const record = item as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.title !== "string") {
      return [];
    }
    return [{ id: record.id, title: record.title }];
  });
}
