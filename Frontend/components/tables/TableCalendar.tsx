"use client";

import { useEffect, useState } from "react";
import styles from "./TableCalendar.module.css";

type View = "daily" | "weekly";
type Reservation = { id: string; customer_name: string; phone: string; date: string; time: string; guests: number; table_code: string; status: string };

const tables = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
const hours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"];
const dayName = new Intl.DateTimeFormat("en", { weekday: "short" });
const dateName = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

function dateAt(date: Date, days: number) { const next = new Date(date); next.setDate(next.getDate() + days); return next; }
function startOfWeek(date: Date) { const start = new Date(date); const shift = (start.getDay() + 6) % 7; start.setDate(start.getDate() - shift); return start; }
function reservationDate(item: Reservation) { return new Date(`${item.date}T${item.time}:00`); }
function timeSlot(time: string) { return `${time.split(":")[0].padStart(2, "0")}:00`; }

export function TableCalendar() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [view, setView] = useState<View>("daily");
  const [date, setDate] = useState(() => new Date());
  const [selected, setSelected] = useState<Reservation | null>(null);
  useEffect(() => { fetch("/api/admin/reservations").then(response => response.json()).then((items: Reservation[]) => { setReservations(items); if (items[0]) setDate(reservationDate(items[0])); }); }, []);
  const days = view === "weekly" ? Array.from({ length: 7 }, (_, index) => dateAt(startOfWeek(date), index)) : [date];
  const title = view === "weekly" ? `${dateName.format(days[0])} – ${dateName.format(days[6])}` : date.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" });
  const move = (amount: number) => setDate(dateAt(date, view === "weekly" ? amount * 7 : amount));
  const bookingFor = (table: string, day: Date, hour?: string) => {
    return reservations.find(item => {
      return item.table_code === table && reservationDate(item).toDateString() === day.toDateString() && (!hour || timeSlot(item.time) === hour);
    });
  };

  return <section className={styles.calendar}><header className={styles.controls}><div><p className={styles.eyebrow}>Dining room availability</p><h2>{title}</h2></div><div className={styles.actions}><button className="button" onClick={() => move(-1)}>← Previous</button><button className="button" onClick={() => setDate(new Date())}>Today</button><button className="button" onClick={() => move(1)}>Next →</button><div className={styles.viewToggle}><button className={view === "daily" ? styles.selected : ""} onClick={() => setView("daily")}>Daily</button><button className={view === "weekly" ? styles.selected : ""} onClick={() => setView("weekly")}>Weekly</button></div></div></header><div className={styles.legend}><span><i className={styles.free} />Available</span><span><i className={styles.booked} />Booked</span></div><div className={styles.scroll}><div className={`${styles.grid} ${view === "daily" ? styles.daily : styles.weekly}`}><div className={styles.corner}>TABLE</div>{view === "daily" ? hours.map(hour => <div className={styles.columnHead} key={hour}>{hour}</div>) : days.map(day => <div className={styles.columnHead} key={day.toISOString()}><strong>{dayName.format(day)}</strong><span>{dateName.format(day)}</span></div>)}{tables.map(table => <div className={styles.row} key={table}><strong className={styles.tableName}>{table}</strong>{view === "daily" ? hours.map(hour => { const booking = bookingFor(table, date, hour); return <div className={`${styles.cell} ${booking ? styles.booked : styles.free}`} key={hour}>{booking && <button onClick={() => setSelected(booking)}>{booking.customer_name}<small>{booking.time}</small></button>}</div>; }) : days.map(day => { const booking = bookingFor(table, day); return <div className={`${styles.cell} ${booking ? styles.booked : styles.free}`} key={day.toISOString()}>{booking && <button onClick={() => setSelected(booking)}>{booking.customer_name}<small>{booking.time}</small></button>}</div>; })}</div>)}</div></div>{selected && <div className={styles.backdrop} onClick={() => setSelected(null)}><section className={styles.modal} onClick={event => event.stopPropagation()}><div className={styles.modalHead}><div><p className={styles.eyebrow}>Reservation #{selected.id.slice(0, 8)}</p><h3>{selected.table_code}</h3></div><button className="button" onClick={() => setSelected(null)}>Close</button></div><dl><div><dt>Guest</dt><dd>{selected.customer_name}</dd></div><div><dt>Time</dt><dd>{selected.date} · {selected.time}</dd></div><div><dt>Party size</dt><dd>{selected.guests} guests</dd></div><div><dt>Status</dt><dd>{selected.status}</dd></div></dl></section></div>}</section>;
}
