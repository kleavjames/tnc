import { apiBaseUrl } from "./api";

export type ChurchBranch = {
  id: string;
  name: string;
  branch: string;
};

/** Returns null when the branches cannot be loaded. */
export async function getChurchBranches(): Promise<ChurchBranch[] | null> {
  try {
    const response = await fetch(`${apiBaseUrl()}/church-branches`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const body: unknown = await response.json();
    if (!Array.isArray(body)) {
      return null;
    }
    return body.filter(isChurchBranch);
  } catch {
    return null;
  }
}

function isChurchBranch(value: unknown): value is ChurchBranch {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.branch === "string"
  );
}
