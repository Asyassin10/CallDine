import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const headers = (request: NextRequest) => ({ Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}` });

export async function GET(request: NextRequest) {
  const response = await fetch(`${backend}/api/v1/conversations`, { headers: headers(request), cache: "no-store" });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: NextRequest) {
  const response = await fetch(`${backend}/api/v1/conversations`, { method: "POST", headers: headers(request) });
  return NextResponse.json(await response.json(), { status: response.status });
}
