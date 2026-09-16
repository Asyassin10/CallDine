"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro } from "@/lib/fixtures";

type Order = { id: string; delivery_address: string; status: string; total: number; created_at: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { fetch("/api/customer/orders").then(response => response.json()).then(setOrders); }, []);
  return <div className="page"><PageHeader eyebrow="Customer" title="Orders" sub="Confirmed delivery orders"/><Card title="Your orders"><DataTable links={orders.map(order => `/app/orders/${order.id}`)} columns={["ORDER", "DATE & TIME", "ADDRESS", "STATUS", "TOTAL"]} rows={orders.map(order => [order.id.slice(0, 8), new Date(order.created_at).toLocaleString(), order.delivery_address, order.status, euro(order.total)])}/></Card></div>;
}
