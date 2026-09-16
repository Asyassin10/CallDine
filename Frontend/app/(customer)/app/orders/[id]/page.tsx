import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Card, DetailList } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { TOKEN_COOKIE } from "@/lib/session";
import { DataTable } from "@/components/ui/DataTable";
import { euro } from "@/lib/fixtures";

type Detail = { id: string; status: string; total: number; created_at: string; delivery_address: string; items: { name: string; quantity: number; unit_price: number }[]; };

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value ?? "";
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/customer/orders/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load details.");
  const item: Detail = await response.json();
  return <div className="page">
    <PageHeader back="/app/orders" eyebrow="Order" title={`Order #${item.id.slice(0, 8)}`} sub={item.status}/>
    <div className="grid">
      <Card className="span8" title="Items">
        <DataTable columns={["ITEM", "QTY", "UNIT PRICE", "TOTAL"]} rows={item.items.map(row => [row.name, row.quantity, euro(row.unit_price), euro(row.quantity * row.unit_price)])}/>
      </Card>
      <Card className="span4" title="Summary"><DetailList rows={[
        ["Status", item.status], ["Date & time", new Date(item.created_at).toLocaleString()],
        ["Delivery address", item.delivery_address], ["Total", euro(item.total)],
      ]}/></Card>
    </div>
  </div>;
}
