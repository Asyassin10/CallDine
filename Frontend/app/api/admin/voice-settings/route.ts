import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

const url = `${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/admin/voice-settings`;
export async function GET(request: NextRequest) { const response = await fetch(url, { headers: { Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}` } }); return NextResponse.json(await response.json(), { status: response.status }); }
export async function PATCH(request: NextRequest) { const response = await fetch(url, { method: "PATCH", headers: { Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}`, "Content-Type": "application/json" }, body: await request.text() }); return NextResponse.json(await response.json(), { status: response.status }); }
