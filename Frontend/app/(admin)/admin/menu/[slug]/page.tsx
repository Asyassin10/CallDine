import { notFound } from "next/navigation";
import { DemoForm } from "@/components/ui/DemoForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro } from "@/lib/fixtures";
import { getMenu } from "@/lib/menu";
export default async function AdminMenuDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const item=(await getMenu()).find(x=>x.slug===slug);if(!item)notFound();return <div className="page"><PageHeader back="/admin/menu" eyebrow="Menu product" title={item.name} sub={`${item.category} · ${euro(item.price)}`}><button className="button danger">Delete product</button></PageHeader><DemoForm title="Product" fields={[["Name",item.name],["Category",item.category],["Price",euro(item.price)],["Availability",item.available?"Available":"Sold out"],["Image URL",item.image,true]]}/></div>}
