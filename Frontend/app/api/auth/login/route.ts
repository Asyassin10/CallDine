import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";
import type { SessionRole } from "@/lib/types";

export async function POST(request:Request){
  const body=await request.json() as {email?:string;password?:string;role?:SessionRole};
  const login=await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:body.email,password:body.password})});
  if(!login.ok)return NextResponse.json({error:"Invalid email or password"},{status:401});
  const result=await login.json() as {token:string;user:{role:SessionRole}};
  if(body.role&&body.role!==result.user.role)return NextResponse.json({error:"Use the correct login page for this account"},{status:401});
  const response=NextResponse.json({ok:true,redirect:result.user.role==="admin"?"/admin":"/app/ai"});
  response.cookies.set(TOKEN_COOKIE,result.token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/"});
  return response;
}
