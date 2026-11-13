import { publishedFileUrl } from "@/lib/published-articles";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const language = new URL(request.url).searchParams.get("language");
  const url = await publishedFileUrl(id, language);
  if (!url) {
    return new Response("Not found", { status: 404 });
  }
  return Response.redirect(url);
}
