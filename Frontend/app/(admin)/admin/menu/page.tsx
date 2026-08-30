import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddMenuItem } from "@/components/menu/AddMenuItem";
import { MenuActions } from "@/components/menu/MenuActions";
import { euro } from "@/lib/fixtures";
import { getCategories, getMenu } from "@/lib/menu";
export default async function AdminMenu(){const [menu,categories]=await Promise.all([getMenu(),getCategories()]);return <div className="page"><PageHeader eyebrow="Operations" title="Menu management" sub={`${menu.length} products saved in SQLite`}><button className="button">Manage categories</button><AddMenuItem categories={categories}/></PageHeader><Card title="Products" sub="Menu items and image URLs"><DataTable columns={["PRODUCT","CATEGORY","PRICE","AVAILABILITY","ACTIONS"]} rows={menu.map(item=>[item.name,item.category,euro(item.price),item.available?"Available":"Sold out",<MenuActions key={item.id} item={item} categories={categories}/>])} links={menu.map(item=>`/admin/menu/${item.slug}`)}/></Card></div>}
