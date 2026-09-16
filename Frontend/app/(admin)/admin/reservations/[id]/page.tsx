import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Card, DetailList } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { TOKEN_COOKIE } from "@/lib/session";

type Reservation = { id: string; customer_name: string; phone: string; date: string; time: string; guests: number; table_code: string; status: string };

export default async function AdminReservationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value ?? "";
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/admin/reservations/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load reservation.");
  const item: Reservation = await response.json();
  return <div className="page"><PageHeader back="/admin/reservations" eyebrow="Reservation" title={`Reservation #${item.id.slice(0, 8)}`} sub={`${item.customer_name} · ${item.date} at ${item.time}`}/><div className="grid"><Card className="span7" title="Booking"><DetailList rows={[["Guest", item.customer_name], ["Date", item.date], ["Time", item.time], ["Guests", item.guests], ["Table", item.table_code], ["Status", item.status]]}/></Card><Card className="span5" title="Contact"><DetailList rows={[["Phone", item.phone]]}/></Card></div></div>;
}
