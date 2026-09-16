import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Card, DetailList } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { TOKEN_COOKIE } from "@/lib/session";


type Detail = { id: string; status: string; date: string; time: string; guests: number; table_code: string; customer_name: string; phone: string; };

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value ?? "";
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/customer/reservations/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load details.");
  const item: Detail = await response.json();
  return <div className="page">
    <PageHeader back="/app/reservations" eyebrow="Reservation" title={`Reservation #${item.id.slice(0, 8)}`} sub={item.status}/>
    <div className="grid">
      <Card className="span6" title="Booking"><DetailList rows={[
        ["Status", item.status], ["Date", item.date], ["Time", item.time],
        ["Guests", item.guests], ["Table", item.table_code],
      ]}/></Card>
      <Card className="span6" title="Guest"><DetailList rows={[
        ["Name", item.customer_name], ["Phone", item.phone],
      ]}/></Card>
    </div>
  </div>;
}
