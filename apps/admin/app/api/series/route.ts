import { proxyJson } from "../../../lib/proxy-api";

export function GET() {
  return proxyJson(undefined, "/series", "GET");
}

export function POST(request: Request) {
  return proxyJson(request, "/series", "POST");
}
