import { proxyJson } from "../../../../../../../lib/proxy-api";

type RouteContext = {
  params: Promise<{ memberId: string; sessionId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { memberId, sessionId } = await context.params;
  return proxyJson(
    request,
    `/glc/members/${encodeURIComponent(memberId)}/sessions/${encodeURIComponent(sessionId)}`,
    "PATCH",
  );
}
