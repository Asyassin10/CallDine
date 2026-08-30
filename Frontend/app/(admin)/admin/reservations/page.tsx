import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { reservations } from "@/lib/fixtures";
export default function AdminReservations(){return <div className="page"><PageHeader eyebrow="Operations" title="Reservations" sub="32 covers booked today · 9 upcoming"><button className="button">Table plan</button><button className="button primary">New reservation</button></PageHeader><Card title="All reservations"><DataTable columns={["RES","GUEST","WHEN","GUESTS","TABLE","STATUS"]} rows={reservations.map(r=>[`#${r.id}`,r.guest,r.when,r.guests,r.table,r.status])} links={reservations.map(r=>`/admin/reservations/${r.id}`)}/></Card></div>}
