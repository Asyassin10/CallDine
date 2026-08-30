import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { customers, euro } from "@/lib/fixtures";
export default function CustomersPage(){return <div className="page"><PageHeader eyebrow="Operations" title="Customers" sub="1,284 customers · 61% returning"><button className="button">Export list</button></PageHeader><Card title="Customer list"><DataTable columns={["CUSTOMER","ORDERS","RESERVATIONS","TOTAL SPENT","LAST ACTIVITY"]} rows={customers.map(c=>[c.name,c.orders,c.reservations,euro(c.spent),c.lastActivity])} links={customers.map(c=>`/admin/customers/${c.id}`)}/></Card></div>}
