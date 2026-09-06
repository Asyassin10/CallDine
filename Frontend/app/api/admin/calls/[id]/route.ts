import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/admin/calls/${id}`, { headers: { Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}` }, cache: "no-store" });
  return NextResponse.json(await response.json(), { status: response.status });
}
