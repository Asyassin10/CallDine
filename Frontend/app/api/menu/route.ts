import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const menu = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
    body: JSON.stringify(await request.json()),
  });
  return NextResponse.json(await menu.json(), { status: menu.status });
}
