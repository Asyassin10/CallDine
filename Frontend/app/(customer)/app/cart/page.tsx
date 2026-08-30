import Link from "next/link";
import { Card, DetailList } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
export default function CartPage(){return <div className="page"><PageHeader eyebrow="Customer" title="Your order" sub="Read-only order summary"><Link className="button primary" href="/app/ai">Back to assistant</Link></PageHeader><div className="grid"><Card className="span8" title="Items" sub="Added during your assistant call"><DataTable columns={["ITEM","SOURCE","QTY","UNIT","LINE"]} rows={[["Burrata, heirloom tomato","Voice","1","€14.00","€14.00"],["Truffle tagliatelle","Voice","1","€24.00","€24.00"],["Sparkling water 0.75l","Voice","2","€4.50","€9.00"]]}/></Card><Card className="span4" title="Summary"><DetailList rows={[["Subtotal","€47.00"],["Service","Included"],["Status","Preparing"],["Total","€47.00"]]}/></Card></div></div>}
