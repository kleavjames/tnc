export type PublicContent = {
  latestSermon: string;
};

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export function isPublicHttpUrl(value: string): boolean {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function getPublicContent(): Promise<PublicContent> {
  const response = await fetch(`${apiBaseUrl()}/content/public`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Could not load site content.");
  }
  const body: unknown = await response.json();
  if (!body || typeof body !== "object") {
    throw new Error("Could not load site content.");
  }
  const record = body as Record<string, unknown>;
  return {
    latestSermon:
      typeof record.latestSermon === "string" ? record.latestSermon : "",
  };
}
