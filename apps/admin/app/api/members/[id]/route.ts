import { proxyJson } from "../../../../lib/proxy-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyJson(
    request,
    `/members/${encodeURIComponent(id)}`,
    "PATCH",
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyJson(undefined, `/members/${encodeURIComponent(id)}`, "DELETE");
}
