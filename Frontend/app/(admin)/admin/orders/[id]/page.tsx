import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Card, DetailList } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro } from "@/lib/fixtures";
import { TOKEN_COOKIE } from "@/lib/session";

type Order = { id: string; customer_name: string; delivery_address: string; status: string; total: number; created_at: string; items: { name: string; quantity: number; unit_price: number }[] };

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value ?? "";
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/api/v1/admin/orders/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load order.");
  const order: Order = await response.json();
  return <div className="page"><PageHeader back="/admin/orders" eyebrow="Order" title={`Order #${order.id.slice(0, 8)}`} sub={order.customer_name}/><div className="grid"><Card className="span7" title="Items"><DataTable columns={["ITEM", "QTY", "UNIT", "TOTAL"]} rows={order.items.map(item => [item.name, item.quantity, euro(item.unit_price), euro(item.quantity * item.unit_price)])}/></Card><Card className="span5" title="Order summary"><DetailList rows={[["Customer", order.customer_name], ["Status", order.status], ["Address", order.delivery_address], ["Total", euro(order.total)], ["Placed", new Date(order.created_at).toLocaleString()]]}/></Card></div></div>;
}
