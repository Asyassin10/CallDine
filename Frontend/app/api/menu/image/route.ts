import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/menu/image`, {
    method: "POST", headers: { Authorization: `Bearer ${token ?? ""}` }, body: await request.formData(),
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
