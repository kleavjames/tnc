import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { GlcProgress } from "./glc-progress";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

export async function getGlcProgress(
  memberId: string,
): Promise<GlcProgress | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }

  const response = await fetch(
    `${apiBaseUrl()}/glc/members/${encodeURIComponent(memberId)}/progress`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Could not load GLC progress.");
  }

  const progress = parseProgress(await response.json());
  if (!progress) {
    throw new Error("Could not load GLC progress.");
  }
  return progress;
}

function parseProgress(value: unknown): GlcProgress | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.memberId !== "string" ||
    typeof record.attendedCount !== "number" ||
    typeof record.sessionCount !== "number" ||
    !Array.isArray(record.levels)
  ) {
    return null;
  }
  const levels = record.levels.flatMap(parseLevel);
  if (levels.length !== record.levels.length) {
    return null;
  }
  return {
    id: record.id,
    memberId: record.memberId,
    attendedCount: record.attendedCount,
    sessionCount: record.sessionCount,
    levels,
  };
}

function parseLevel(value: unknown): GlcProgress["levels"] {
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.level !== "number" ||
    typeof record.name !== "string" ||
    typeof record.title !== "string" ||
    !Array.isArray(record.books)
  ) {
    return [];
  }
  const books = record.books.flatMap(parseBook);
  if (books.length !== record.books.length) {
    return [];
  }
  return [
    {
      id: record.id,
      level: record.level,
      name: record.name,
      title: record.title,
      books,
    },
  ];
}

function parseBook(value: unknown): GlcProgress["levels"][number]["books"] {
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.number !== "number" ||
    typeof record.title !== "string" ||
    !Array.isArray(record.sessions)
  ) {
    return [];
  }
  const sessions = record.sessions.flatMap(parseSession);
  if (sessions.length !== record.sessions.length) {
    return [];
  }
  return [
    {
      id: record.id,
      number: record.number,
      title: record.title,
      sessions,
    },
  ];
}

function parseSession(
  value: unknown,
): GlcProgress["levels"][number]["books"][number]["sessions"] {
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.number !== "number" ||
    typeof record.title !== "string" ||
    typeof record.attended !== "boolean"
  ) {
    return [];
  }
  return [
    {
      id: record.id,
      number: record.number,
      title: record.title,
      attended: record.attended,
    },
  ];
}
