import { notFound } from "next/navigation";
import { MenuHero } from "@/components/menu/MenuHero";
import { Card, DetailList } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { euro } from "@/lib/fixtures";
import { getMenu } from "@/lib/menu";
export default async function MenuDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const item=(await getMenu()).find(value=>value.slug===slug);if(!item)notFound();return <div className="page"><PageHeader back="/app/menu" eyebrow={item.category} title={item.name} sub={`${euro(item.price)} · ${item.available?"Available":"Sold out"}`}/><div className="grid"><Card className="span7"><MenuHero src={item.image} alt={item.name}/></Card><Card className="span5" title="Dish details"><DetailList rows={[["Category",item.category],["Price",euro(item.price)],["Availability",item.available?"Available":"Sold out"],["Source","TheMealDB"]]}/></Card></div></div>}
