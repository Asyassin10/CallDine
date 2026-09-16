import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";
import type { SessionRole } from "@/lib/types";

async function getRole(token?:string):Promise<SessionRole|null>{
  if(!token)return null;
  const response=await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/auth/me`,{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
  if(!response.ok)return null;
  const user=await response.json() as {role:SessionRole};
  return user.role;
}

export async function proxy(request: NextRequest) {
  const role = await getRole(request.cookies.get(TOKEN_COOKIE)?.value);
  const path = request.nextUrl.pathname;
  if (path.startsWith("/app") && role !== "customer") return NextResponse.redirect(new URL("/login",request.url));
  if (path.startsWith("/admin") && path !== "/admin/login" && role !== "admin") return NextResponse.redirect(new URL("/admin/login",request.url));
  if ((path==="/login"||path==="/admin/login") && role) return NextResponse.redirect(new URL(role==="admin"?"/admin":"/app/ai",request.url));
  return NextResponse.next();
}

export const config={matcher:["/app/:path*","/admin/:path*","/login"]};
