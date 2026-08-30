import { TableCalendar } from "@/components/tables/TableCalendar";
import { PageHeader } from "@/components/ui/PageHeader";

export default function TableManagementPage() {
  return <div className="page"><PageHeader eyebrow="Operations" title="Table management" sub="Osteria Vento · dining room availability" /><TableCalendar /></div>;
}
