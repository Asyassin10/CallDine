import { Dashboard } from "@/components/dashboard/Dashboard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminOverview() {
  return <div className="page"><PageHeader eyebrow="Restaurant Admin" title="Overview" sub="Osteria Vento · operations today"/><Dashboard/></div>;
}
