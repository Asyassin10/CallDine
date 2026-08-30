"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import styles from "./AppShell.module.css";
import type { SessionRole } from "@/lib/types";

const customerNav = [["Assistant","/app/ai"],["Menu","/app/menu"],["Orders","/app/orders"],["Reservations","/app/reservations"],["Profile","/app/profile"]];
const adminNav = [["Overview","/admin"],["Orders","/admin/orders"],["Reservations","/admin/reservations"],["Menu","/admin/menu"],["Knowledge Base","/admin/knowledge"],["Table management","/admin/tables"],["AI Calls","/admin/calls"],["Recommendations","/admin/recommendations"],["Customers","/admin/customers"],["Settings","/admin/settings"]];

export function AppShell({role,children}:{role:SessionRole;children:React.ReactNode}){
  const pathname=usePathname(), router=useRouter(), [open,setOpen]=useState(false);
  const nav=role==="admin"?adminNav:customerNav;
  const active=(href:string)=>href===(role==="admin"?"/admin":"/app")?pathname===href:pathname.startsWith(href);
  async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.replace(role==="admin"?"/admin/login":"/login");router.refresh()}
  return <div className={`${styles.shell} ${pathname==="/app/ai"?styles.voiceShell:""}`}>
    {open&&<button className={styles.overlay} aria-label="Close menu" onClick={()=>setOpen(false)}/>}<button className={styles.mobileButton} aria-label="Open menu" onClick={()=>setOpen(!open)}>☰</button>
    <aside className={`${styles.sidebar} ${open?styles.open:""}`}><div className={styles.brand}><Logo/><small>{role==="admin"?"Restaurant Admin":"Guest app"}</small></div>
      <nav className={styles.nav}>{nav.map(([label,href],index)=><div key={href}>{role==="admin"&&[0,6,9].includes(index)&&<div className={styles.group}>{index===0?"OPERATIONS":index===6?"AI":"ACCOUNT"}</div>}<Link onClick={()=>setOpen(false)} className={`${styles.link} ${active(href)?styles.active:""}`} href={href}>{label}</Link></div>)}</nav>
      <div className={styles.account}><div className={styles.accountInfo}><span className={styles.avatar}>{role==="admin"?"A":"Y"}</span><span className={styles.accountText}>{role==="admin"?"Admin":"Yassine"}<small>{role==="admin"?"Owner":"Guest"}</small></span><button className={styles.logout} onClick={logout}>LOG OUT</button></div></div>
    </aside><main className={styles.main}>{children}</main>
  </div>;
}
