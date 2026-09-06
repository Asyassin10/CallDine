import { TableCalendar } from "@/components/tables/TableCalendar";
import { FloorPlan } from "@/components/tables/FloorPlan";
import { PageHeader } from "@/components/ui/PageHeader";

export default function TableManagementPage() {
  return <div className="page"><PageHeader eyebrow="Operations" title="Table management" sub="Osteria Vento · dining room availability" /><FloorPlan/><TableCalendar /></div>;
}
