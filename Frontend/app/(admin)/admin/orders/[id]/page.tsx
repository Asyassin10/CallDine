import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, DetailList } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro, orders } from "@/lib/fixtures";
export default async function AdminOrderDetail({params}:{params:Promise<{id:string}>}){const {id}=await params;const order=orders.find(o=>o.id===id);if(!order)notFound();return <div className="page"><PageHeader back="/admin/orders" eyebrow="Order" title={`Order #${order.id}`} sub={`${order.customer} · ${order.source}`}><button className="button">Print ticket</button><button className="button primary">Mark as ready</button></PageHeader><div className="grid"><Card className="span7" title="Items"><DataTable columns={["ITEM","QTY","UNIT","TOTAL"]} rows={[["Burrata, heirloom tomato",1,"€14.00","€14.00"],["Truffle tagliatelle",1,"€24.00","€24.00"]]}/></Card><Card className="span5" title="Order summary"><DetailList rows={[["Status",order.status],["Total",euro(order.total)],["Placed",order.placed],["Source",order.source]]}/>{order.source==="Voice"&&<Link className="button" style={{display:"inline-flex",marginTop:12}} href="/admin/calls/8291">Open call recording</Link>}</Card></div></div>}
