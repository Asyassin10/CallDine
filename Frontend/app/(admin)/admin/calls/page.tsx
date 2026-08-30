import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { calls } from "@/lib/fixtures";
export default function CallsPage(){return <div className="page"><PageHeader eyebrow="AI" title="AI Calls" sub="32 calls today · 29 successful · avg 03:12"><button className="button">Export transcripts</button></PageHeader><Card title="Call log"><DataTable columns={["CALL","CUSTOMER","DATE","DURATION","INTENT","RESULT","ORDER","RESERVATION"]} rows={calls.map(c=>[`#${c.id}`,c.customer,c.date,c.duration,c.intent,c.result,c.order?`#${c.order}`:"—",c.reservation?`#${c.reservation}`:"—"])} links={calls.map(c=>`/admin/calls/${c.id}`)}/></Card></div>}
