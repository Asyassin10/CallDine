"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import type { SessionRole } from "@/lib/types";
import styles from "./AppShell.module.css";

const customerNav = [["Assistant", "/app/ai", "mic"], ["Menu", "/app/menu", "menu"], ["Orders", "/app/orders", "orders"], ["Reservations", "/app/reservations", "calendar"], ["Profile", "/app/profile", "user"]];
const adminNav = [["Overview", "/admin", "overview"], ["Orders", "/admin/orders", "orders"], ["Reservations", "/admin/reservations", "calendar"], ["Menu", "/admin/menu", "menu"], ["Knowledge Base", "/admin/knowledge", "book"], ["Table management", "/admin/tables", "tables"], ["AI Calls", "/admin/calls", "headset"], ["Recommendations", "/admin/recommendations", "sparkles"], ["Customers", "/admin/customers", "users"], ["Settings", "/admin/settings", "settings"]];

const paths: Record<string, React.ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  orders: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
  menu: <><path d="M7 3v8M4 3v5c0 2 6 2 6 0V3M7 11v10M16 3v18M16 3c4 3 4 8 0 10"/></>,
  book: <><path d="M4 5c4-2 7 0 8 2v14c-1-2-4-4-8-2V5ZM20 5c-4-2-7 0-8 2v14c1-2 4-4 8-2V5Z"/></>,
  tables: <><rect x="5" y="7" width="14" height="10" rx="2"/><path d="M8 4v3M16 4v3M8 17v3M16 17v3M2 10h3M19 10h3M2 14h3M19 14h3"/></>,
  headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2ZM20 13h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 19c-1 2-3 2-5 2"/></>,
  sparkles: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 13l.7 2.3L8 16l-2.3.7L5 19l-.7-2.3L2 16l2.3-.7L5 13Z"/></>,
  users: <><circle cx="9" cy="8" r="4"/><path d="M2 21c0-5 3-8 7-8s7 3 7 8M16 4c3 0 5 2 5 5s-2 5-5 5M17 14c3 1 5 3 5 7"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  mic: <><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/></>,
};

function NavIcon({ name }: { name: string }) {
  return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function AppShell({ role, children }: { role: SessionRole; children: React.ReactNode }) {
  const pathname = usePathname(), router = useRouter(), [open, setOpen] = useState(false);
  const nav = role === "admin" ? adminNav : customerNav;
  const active = (href: string) => href === (role === "admin" ? "/admin" : "/app") ? pathname === href : pathname.startsWith(href);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace(role === "admin" ? "/admin/login" : "/login"); router.refresh(); }
  return <div className={`${styles.shell} ${pathname === "/app/ai" ? styles.voiceShell : ""}`}>{open && <button className={styles.overlay} aria-label="Close menu" onClick={() => setOpen(false)}/>}<button className={styles.mobileButton} aria-label="Open menu" onClick={() => setOpen(!open)}>☰</button><aside className={`${styles.sidebar} ${open ? styles.open : ""}`}><div className={styles.brand}><Logo/><small>{role === "admin" ? "Restaurant Admin" : "Guest app"}</small></div><nav className={styles.nav}>{nav.map(([label, href, icon], index) => <div key={href}>{role === "admin" && [0, 6, 9].includes(index) && <div className={styles.group}>{index === 0 ? "OPERATIONS" : index === 6 ? "AI" : "ACCOUNT"}</div>}<Link onClick={() => setOpen(false)} className={`${styles.link} ${active(href) ? styles.active : ""}`} href={href}><NavIcon name={icon}/><span>{label}</span></Link></div>)}</nav><div className={styles.account}><div className={styles.accountInfo}><span className={styles.avatar}>{role === "admin" ? "A" : "Y"}</span><span className={styles.accountText}>{role === "admin" ? "Admin" : "Yassine"}<small>{role === "admin" ? "Owner" : "Guest"}</small></span><button className={styles.logout} onClick={logout}>LOG OUT</button></div></div></aside><main className={styles.main}>{children}</main></div>;
}
