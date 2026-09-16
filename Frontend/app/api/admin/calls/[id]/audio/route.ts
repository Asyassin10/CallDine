import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers: Record<string, string> = { Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}` };
  if (request.headers.get("range")) headers.Range = request.headers.get("range")!;
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/admin/calls/${id}/audio`, { headers });
  const forwarded = new Headers({ "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream", "Cache-Control": "private, no-store" });
  for (const name of ["accept-ranges", "content-length", "content-range", "content-disposition"]) if (response.headers.get(name)) forwarded.set(name, response.headers.get(name)!);
  return new NextResponse(response.body, { status: response.status, headers: forwarded });
}
