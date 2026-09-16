import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export async function POST(request:NextRequest){
  const token=request.cookies.get(TOKEN_COOKIE)?.value;
  if(token)await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/auth/logout`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
  const response=NextResponse.json({ok:true});
  response.cookies.set(TOKEN_COOKIE,"",{httpOnly:true,path:"/",maxAge:0});
  return response;
}
