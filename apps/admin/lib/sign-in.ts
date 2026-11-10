"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, apiBaseUrl } from "./session-cookie";

export type SignInState = { error: string | null };

export async function signIn(
  _state: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not sign in. Try again." };
  }

  if (!response.ok) {
    return { error: "Invalid username or password." };
  }

  const body = (await response.json()) as { token?: unknown };
  if (typeof body.token !== "string" || body.token.length === 0) {
    return { error: "Could not sign in. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, body.token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/dashboard");
}
