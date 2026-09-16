import { notFound } from "next/navigation";
import { MenuDetailForm } from "@/components/menu/MenuDetailForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro } from "@/lib/fixtures";
import { getCategories, getMenu } from "@/lib/menu";
export default async function AdminMenuDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [menu,categories]=await Promise.all([getMenu(),getCategories()]);const item=menu.find(x=>x.slug===slug);if(!item)notFound();return <div className="page"><PageHeader back="/admin/menu" eyebrow="Menu product" title={item.name} sub={`${item.category} · ${euro(item.price)}`}><button className="button danger">Delete product</button></PageHeader><MenuDetailForm item={item} categories={categories}/></div>}
