import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function GET(request: NextRequest) {
  const response = await fetch(`${backend}/api/v1/knowledge`, { headers: { Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}` } });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: NextRequest) {
  const response = await fetch(`${backend}/api/v1/knowledge`, { method: "POST", headers: { Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}` }, body: await request.formData() });
  return NextResponse.json(await response.json(), { status: response.status });
}
