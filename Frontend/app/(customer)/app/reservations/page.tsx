import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { reservations } from "@/lib/fixtures";
export default function ReservationsPage(){return <div className="page"><PageHeader eyebrow="Customer" title="Reservations" sub="Read-only reservations"/><Card title="Upcoming"><DataTable columns={["RES","WHEN","GUESTS","TABLE","STATUS"]} rows={reservations.map(r=>[`#${r.id}`,r.when,r.guests,r.table,r.status])} links={reservations.map(r=>`/app/reservations/${r.id}`)}/></Card></div>}
