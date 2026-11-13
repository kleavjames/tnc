import { proxyJson } from "../../../../../lib/proxy-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyJson(
    request,
    `/articles/${encodeURIComponent(id)}/unpublish`,
    "POST",
  );
}
