import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

async function forward(request: NextRequest, id: string, method: "PUT" | "DELETE") {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const menu = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/menu/${id}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
    body: method === "PUT" ? JSON.stringify(await request.json()) : undefined,
  });
  if (menu.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await menu.json(), { status: menu.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return forward(request, (await params).id, "PUT");
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return forward(request, (await params).id, "DELETE");
}
