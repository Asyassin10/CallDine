"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";

type Reservation = { id: string; date: string; time: string; guests: number; table_code: string; status: string };

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  useEffect(() => { fetch("/api/customer/reservations").then(response => response.json()).then(setReservations); }, []);
  return <div className="page"><PageHeader eyebrow="Customer" title="Reservations" sub="Confirmed restaurant bookings"/><Card title="Upcoming"><DataTable links={reservations.map(reservation => `/app/reservations/${reservation.id}`)} columns={["RES", "WHEN", "GUESTS", "TABLE", "STATUS"]} rows={reservations.map(reservation => [reservation.id.slice(0, 8), `${reservation.date} · ${reservation.time}`, reservation.guests, reservation.table_code, reservation.status])}/></Card></div>;
}
