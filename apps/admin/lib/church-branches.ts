import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

export type ChurchBranch = {
  id: string;
  name: string;
  branch: string;
};

export async function listChurchBranches(): Promise<ChurchBranch[]> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }

  const response = await fetch(`${apiBaseUrl()}/church-branches`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load church branches.");
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error("Could not load church branches.");
  }

  return body.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const record = item as Record<string, unknown>;
    if (
      typeof record.id !== "string" ||
      typeof record.name !== "string" ||
      typeof record.branch !== "string"
    ) {
      return [];
    }
    return [
      { id: record.id, name: record.name, branch: record.branch },
    ];
  });
}
