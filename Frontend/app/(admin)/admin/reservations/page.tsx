"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";

type Reservation = { id: string; customer_name: string; date: string; time: string; guests: number; table_code: string; status: string };

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  useEffect(() => { fetch("/api/admin/reservations").then(response => response.json()).then(setReservations); }, []);
  return <div className="page"><PageHeader eyebrow="Operations" title="Reservations" sub="Confirmed table bookings"><Link className="button" href="/admin/tables">Table calendar</Link></PageHeader><Card title="All reservations"><DataTable links={reservations.map(item => `/admin/reservations/${item.id}`)} columns={["RES", "GUEST", "WHEN", "GUESTS", "TABLE", "STATUS"]} rows={reservations.map(item => [item.id.slice(0, 8), item.customer_name, `${item.date} · ${item.time}`, item.guests, item.table_code, item.status])}/></Card></div>;
}
