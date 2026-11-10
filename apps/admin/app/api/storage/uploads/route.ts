import { proxyJson } from "../../../../lib/proxy-api";

export function POST(request: Request) {
  return proxyJson(request, "/storage/uploads", "POST");
}
