import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro, orders } from "@/lib/fixtures";
export default function AdminOrders(){return <div className="page"><PageHeader eyebrow="Operations" title="Orders" sub="86 orders today · 14 open"><button className="button">Export CSV</button><button className="button primary">New manual order</button></PageHeader><div className="tabs">{["All","Open","Ready","Completed","Cancelled"].map((tab,i)=><button className={`tab ${i===0?"active":""}`} key={tab}>{tab}</button>)}</div><Card title="All orders"><DataTable columns={["ORDER","CUSTOMER","SOURCE","STATUS","TOTAL","PLACED","ITEMS"]} rows={orders.map(o=>[`#${o.id}`,o.customer,o.source,o.status,euro(o.total),o.placed,o.items])} links={orders.map(o=>`/admin/orders/${o.id}`)}/></Card></div>}
