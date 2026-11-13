import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { GlcAttendance, GlcProgress } from "./glc-progress";
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

export async function listGlcAttendance(): Promise<GlcAttendance> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }

  const response = await fetch(`${apiBaseUrl()}/glc/attendance`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (!response.ok) {
    throw new Error("Could not load GLC attendance.");
  }

  const attendance = parseAttendance(await response.json());
  if (!attendance) {
    throw new Error("Could not load GLC attendance.");
  }
  return attendance;
}

function parseAttendance(value: unknown): GlcAttendance | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.levels) || !Array.isArray(record.members)) {
    return null;
  }
  const levels = record.levels.flatMap(parseAttendanceLevel);
  const members = record.members.flatMap(parseAttendanceMember);
  if (
    levels.length !== record.levels.length ||
    members.length !== record.members.length
  ) {
    return null;
  }
  return { levels, members };
}

function parseAttendanceLevel(value: unknown): GlcAttendance["levels"] {
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
  const books = record.books.flatMap(parseAttendanceBook);
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

function parseAttendanceBook(
  value: unknown,
): GlcAttendance["levels"][number]["books"] {
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
  const sessions = record.sessions.flatMap(parseAttendanceSession);
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

function parseAttendanceSession(
  value: unknown,
): GlcAttendance["levels"][number]["books"][number]["sessions"] {
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.number !== "number" ||
    typeof record.title !== "string"
  ) {
    return [];
  }
  return [
    {
      id: record.id,
      number: record.number,
      title: record.title,
    },
  ];
}

function parseAttendanceMember(value: unknown): GlcAttendance["members"] {
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  const attendedSessionIds = stringList(record.attendedSessionIds);
  if (
    typeof record.id !== "string" ||
    typeof record.firstName !== "string" ||
    typeof record.lastName !== "string" ||
    !isBranch(record.branch) ||
    !attendedSessionIds
  ) {
    return [];
  }
  return [
    {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      branch: record.branch,
      attendedSessionIds,
    },
  ];
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const ids = value.filter((id): id is string => typeof id === "string");
  return ids.length === value.length ? ids : null;
}

function isBranch(
  value: unknown,
): value is GlcAttendance["members"][number]["branch"] {
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
