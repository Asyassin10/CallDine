"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro } from "@/lib/fixtures";

type Order = { id: string; customer_name: string; delivery_address: string; status: string; total: number; created_at: string };

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { fetch("/api/admin/orders").then(response => response.json()).then(setOrders); }, []);
  return <div className="page"><PageHeader eyebrow="Operations" title="Orders" sub="Confirmed delivery orders"/><Card title="All orders"><DataTable links={orders.map(order => `/admin/orders/${order.id}`)} columns={["ORDER", "CUSTOMER", "ADDRESS", "STATUS", "TOTAL", "PLACED"]} rows={orders.map(order => [order.id.slice(0, 8), order.customer_name, order.delivery_address, order.status, euro(order.total), new Date(order.created_at).toLocaleString()])}/></Card></div>;
}
