import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/menu/images/${encodeURIComponent(filename)}`);
  return new NextResponse(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "image/jpeg", "Cache-Control": "public, max-age=86400" } });
}
