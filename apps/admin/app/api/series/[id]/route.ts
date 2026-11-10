import { proxyJson } from "../../../../lib/proxy-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyJson(undefined, `/series/${encodeURIComponent(id)}`, "DELETE");
}
