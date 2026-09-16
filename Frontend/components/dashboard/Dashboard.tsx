"use client";

import { useEffect, useState } from "react";
import { Kpis } from "@/components/ui/Card";
import styles from "./Dashboard.module.css";

type Day = { date: string; revenue: number; orders: number; reservations: number };
type Month = { month: string; orders: number; reservations: number };
type Data = { stats: { revenue: number; orders: number; reservations: number; ai_success_rate: number; successful_ai_calls: number; ai_calls: number }; days: Day[]; months: Month[]; statuses: Record<"confirmed" | "preparing" | "ready" | "completed", number> };
const money = new Intl.NumberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const dayName = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en", { weekday: "short" });

function RevenueLineChart({ days }: { days: Day[] }) {
  const max = Math.max(...days.map(day => day.revenue), 1);
  const total = days.reduce((sum, day) => sum + day.revenue, 0);
  const points = days.map((day, index) => `${2 + index * 96 / Math.max(days.length - 1, 1)},${94 - day.revenue / max * 76}`).join(" ");
  return <section className={`${styles.card} ${styles.lineCard}`}><header className={styles.revenueHead}><div><span>Revenue this week</span><strong>{money.format(total)}</strong></div><small>Last 7 days</small></header><div className={styles.linePlot}><div className={styles.gridLines}>{[20, 40, 60, 80].map(line => <i key={line} style={{ bottom: `${line}%` }}/>)}</div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Revenue for the last seven days"><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#c9502f" stopOpacity=".18"/><stop offset="1" stopColor="#c9502f" stopOpacity="0"/></linearGradient></defs><polygon points={`2,96 ${points} 98,96`} fill="url(#revenue-fill)"/><polyline points={points} fill="none" stroke="#b8462b" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/></svg><div className={styles.points}>{days.map((day, index) => <i key={day.date} title={`${dayName(day.date)}: ${money.format(day.revenue)}`} style={{ left: `${2 + index * 96 / Math.max(days.length - 1, 1)}%`, top: `${94 - day.revenue / max * 76}%` }}/>)}</div></div><div className={styles.labels}>{days.map(day => <span key={day.date}>{dayName(day.date)}</span>)}</div></section>;
}

function OrderStatusDonut({ statuses }: { statuses: Data["statuses"] }) {
  const entries = Object.entries(statuses) as Array<[keyof Data["statuses"], number]>;
  const colors = { confirmed: "#d77b44", preparing: "#c9502f", ready: "#e5ad55", completed: "#4e8358" };
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  let position = 0;
  const gradient = total ? entries.map(([name, value]) => { const start = position; position += value / total * 100; return `${colors[name]} ${start}% ${position}%`; }).join(",") : "#ead7c0 0 100%";
  return <section className={`${styles.card} ${styles.donutCard}`}><ChartHead eyebrow="Order flow" title="Order status"/><div className={styles.donutWrap}><div className={styles.donut} style={{ background: `conic-gradient(${gradient})` }}><div><strong>{total}</strong><span>orders</span></div></div><div className={styles.legend}>{entries.map(([name, value]) => <div key={name}><i style={{ background: colors[name] }}/><span>{name}</span><strong>{total ? Math.round(value / total * 100) : 0}%</strong></div>)}</div></div></section>;
}

function ActivityBarChart({ months }: { months: Month[] }) {
  const max = Math.max(...months.flatMap(month => [month.orders, month.reservations]), 1);
  return <section className={`${styles.card} ${styles.barCard}`}><div className={styles.barHead}><ChartHead eyebrow="Guest activity" title="Monthly orders and reservations"/><div className={styles.barLegend}><span><i className={styles.orderColor}/>Orders</span><span><i className={styles.reservationColor}/>Reservations</span></div></div><div style={{ overflowX: "auto" }}><div className={styles.bars} style={{ minWidth: 680 }}>{months.map(month => <div className={styles.barGroup} key={month.month}><div><i className={styles.orderBar} style={{ height: `${month.orders / max * 100}%` }} title={`${month.orders} orders`}/><i className={styles.reservationBar} style={{ height: `${month.reservations / max * 100}%` }} title={`${month.reservations} reservations`}/></div><span>{new Date(`${month.month}-01T12:00:00`).toLocaleDateString("en", { month: "short" })}</span></div>)}</div></div></section>;
}

function ChartHead({ eyebrow, title }: { eyebrow: string; title: string }) { return <header className={styles.chartHead}><p>{eyebrow}</p><h2>{title}</h2></header>; }

export function Dashboard() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch("/api/admin/dashboard").then(response => response.json()).then(setData); }, []);
  if (!data) return <div className={styles.loading}>Loading dashboard…</div>;
  return <div className="grid"><div className="span12"><Kpis items={[["Revenue", money.format(data.stats.revenue), "Today"], ["Orders", String(data.stats.orders), "Today"], ["Reservations", String(data.stats.reservations), "Today"], ["AI success rate", `${data.stats.ai_success_rate}%`, `${data.stats.successful_ai_calls} of ${data.stats.ai_calls} calls`]]}/></div><div className="span8"><RevenueLineChart days={data.days}/></div><div className="span4"><OrderStatusDonut statuses={data.statuses}/></div><div className="span12"><ActivityBarChart months={data.months}/></div></div>;
}
