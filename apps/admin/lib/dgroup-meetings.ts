import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

export type DgroupMeetingOption = {
  id: string;
  name: string;
  days: string[];
  time: string;
};

export async function listDgroupMeetings(): Promise<DgroupMeetingOption[]> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }

  const response = await fetch(`${apiBaseUrl()}/members/dgroup-meetings`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (!response.ok) {
    throw new Error("Could not load dgroup meetings.");
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error("Could not load dgroup meetings.");
  }

  return body.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const record = item as Record<string, unknown>;
    if (
      typeof record.id !== "string" ||
      typeof record.name !== "string" ||
      typeof record.time !== "string"
    ) {
      return [];
    }
    return [
      {
        id: record.id,
        name: record.name,
        time: record.time,
        days: Array.isArray(record.days)
          ? record.days.filter((day): day is string => typeof day === "string")
          : [],
      },
    ];
  });
}
