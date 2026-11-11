import { proxyJson } from "../../../../../../lib/proxy-api";

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { memberId } = await context.params;
  return proxyJson(
    request,
    `/glc/members/${encodeURIComponent(memberId)}/progress`,
    "GET",
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { memberId } = await context.params;
  return proxyJson(
    request,
    `/glc/members/${encodeURIComponent(memberId)}/progress`,
    "POST",
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const { memberId } = await context.params;
  return proxyJson(
    request,
    `/glc/members/${encodeURIComponent(memberId)}/progress`,
    "DELETE",
  );
}
