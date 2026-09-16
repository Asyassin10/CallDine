import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/voice/speech`, { method: "POST", headers: { Authorization: `Bearer ${request.cookies.get(TOKEN_COOKIE)?.value ?? ""}`, "Content-Type": "application/json" }, body: await request.text() });
    if (!response.ok || !response.body) return NextResponse.json({ detail: "Speech service is unavailable." }, { status: response.status || 503 });
    return new NextResponse(response.body, { status: response.status, headers: { "Content-Type": "audio/mpeg" } });
  } catch {
    return NextResponse.json({ detail: "Speech service is unavailable." }, { status: 503 });
  }
}
