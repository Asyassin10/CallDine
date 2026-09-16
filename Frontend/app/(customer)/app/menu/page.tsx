import { MenuGrid } from "@/components/menu/MenuGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMenu } from "@/lib/menu";
export default async function MenuPage(){const menu=await getMenu();return <div className="page"><PageHeader eyebrow="Osteria Vento" title="Menu" sub={`${menu.length} dishes · prices in EUR`}/><MenuGrid items={menu}/><p className="muted" style={{fontSize:11,marginTop:18}}>Initial meal names and images via TheMealDB.</p></div>}
