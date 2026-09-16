"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";

type Call = { id: string; customer_name: string; title: string; created_at: string; updated_at: string };

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  useEffect(() => { fetch("/api/admin/calls").then(response => response.json()).then(setCalls); }, []);
  return <div className="page"><PageHeader eyebrow="AI" title="Voice calls" sub="Text transcripts from customer and assistant conversations"/><Card title="Call log"><DataTable columns={["CALL", "CUSTOMER", "STARTED", "LAST MESSAGE"]} rows={calls.map(call => [call.id.slice(0, 8), call.customer_name, new Date(call.created_at).toLocaleString(), call.title])} links={calls.map(call => `/admin/calls/${call.id}`)}/></Card></div>;
}
