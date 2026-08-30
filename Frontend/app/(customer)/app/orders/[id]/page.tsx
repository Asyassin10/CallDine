import { notFound } from "next/navigation";
import { Card, DetailList } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro, orders } from "@/lib/fixtures";
export default async function OrderDetail({params}:{params:Promise<{id:string}>}){const {id}=await params;const order=orders.find(o=>o.id===id);if(!order)notFound();return <div className="page"><PageHeader back="/app/orders" eyebrow="Order" title={`Order #${order.id}`} sub={`${order.placed} · ${order.status.toLowerCase()}`}/><div className="grid"><Card className="span8" title="Items"><DataTable columns={["ITEM","QTY","PRICE"]} rows={[["Burrata, heirloom tomato","1","€14.00"],["Truffle tagliatelle","1","€24.00"]]}/></Card><Card className="span4" title="Summary"><DetailList rows={[["Status",order.status],["Date & time",order.placed],["Items",order.items],["Total",euro(order.total)]]}/></Card></div></div>}
