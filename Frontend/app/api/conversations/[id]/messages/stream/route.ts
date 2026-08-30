import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/conversations/${id}/messages/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}` },
    body: await request.text(),
  });
  if (!response.body) return new NextResponse(null, { status: response.status });
  return new NextResponse(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/plain; charset=utf-8" } });
}
