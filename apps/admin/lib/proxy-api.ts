import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

export async function proxyJson(
  request: Request | undefined,
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
): Promise<NextResponse> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(method === "POST" || method === "PATCH"
        ? { "content-type": "application/json" }
        : {}),
    },
    body:
      method === "POST" || method === "PATCH"
        ? await request?.text()
        : undefined,
    cache: "no-store",
  });
  const payload = await response.text();
  return new NextResponse(payload, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}
