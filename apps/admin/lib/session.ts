import { cookies } from "next/headers";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

export type Session = {
  user: { id: string; username: string };
  expiresAt: string;
};

export async function readSession(): Promise<
  | { status: "ok"; session: Session }
  | { status: "anonymous" }
  | { status: "expired" }
  | { status: "unavailable" }
> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return { status: "anonymous" };
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}/auth/session`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 401) {
    return { status: "expired" };
  }
  if (!response.ok) {
    return { status: "unavailable" };
  }

  const body = (await response.json()) as Partial<Session>;
  if (
    typeof body.expiresAt !== "string" ||
    !body.user ||
    typeof body.user.id !== "string" ||
    typeof body.user.username !== "string"
  ) {
    return { status: "unavailable" };
  }

  return {
    status: "ok",
    session: {
      expiresAt: body.expiresAt,
      user: { id: body.user.id, username: body.user.username },
    },
  };
}
