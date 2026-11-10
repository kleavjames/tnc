import { proxyJson } from "../../../lib/proxy-api";

export function GET() {
  return proxyJson(undefined, "/content", "GET");
}

export function PATCH(request: Request) {
  return proxyJson(request, "/content", "PATCH");
}
