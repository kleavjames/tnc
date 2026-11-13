import { proxyJson } from "../../../../lib/proxy-api";

export function GET(request: Request) {
  return proxyJson(request, "/glc/attendance", "GET");
}
