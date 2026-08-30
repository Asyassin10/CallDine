import { notFound } from "next/navigation";
import { Card, DetailList } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { reservations } from "@/lib/fixtures";
export default async function ReservationDetail({params}:{params:Promise<{id:string}>}){const {id}=await params;const item=reservations.find(r=>r.id===id);if(!item)notFound();return <div className="page"><PageHeader back="/app/reservations" eyebrow="Reservation" title={`Reservation #${item.id}`} sub={`${item.when} · ${item.guests} guests`}/><div className="grid"><Card className="span6" title="Booking"><DetailList rows={[["Status",item.status],["When",item.when],["Guests",item.guests],["Table",item.table]]}/></Card><Card className="span6" title="Restaurant"><DetailList rows={[["Name","Osteria Vento"],["Address","Oranienstraße 118, Berlin"],["Phone","+49 30 4477 2210"]]}/></Card></div></div>}
