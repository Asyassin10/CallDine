import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddMenuItem } from "@/components/menu/AddMenuItem";
import { AdminMenuTable } from "@/components/menu/AdminMenuTable";
import { getCategories, getMenu } from "@/lib/menu";
export default async function AdminMenu(){const [menu,categories]=await Promise.all([getMenu(),getCategories()]);return <div className="page"><PageHeader eyebrow="Operations" title="Menu management" sub="Manage dishes, availability, and stock."><button className="button">Manage categories</button><AddMenuItem categories={categories}/></PageHeader><Card title="Products" sub="Menu items, stock, and images"><AdminMenuTable items={menu} categories={categories}/></Card></div>}
