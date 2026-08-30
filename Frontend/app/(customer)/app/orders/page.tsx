import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro, orders } from "@/lib/fixtures";
export default function OrdersPage(){return <div className="page"><PageHeader eyebrow="Customer" title="Orders" sub="Live status and history"/><Card title="Your orders"><DataTable columns={["ORDER","PLACED","SOURCE","STATUS","ITEMS","TOTAL"]} rows={orders.map(o=>[`#${o.id}`,o.placed,o.source,o.status,o.items,euro(o.total)])} links={orders.map(o=>`/app/orders/${o.id}`)}/></Card></div>}
