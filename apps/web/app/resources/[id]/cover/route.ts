import { publishedCoverUrl } from "@/lib/published-articles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = await publishedCoverUrl(id);
  if (!url) {
    return new Response("Not found", { status: 404 });
  }
  return Response.redirect(url);
}
