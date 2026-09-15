import { Card, DetailList } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
export default function ProfilePage(){return <div className="page"><PageHeader eyebrow="Account" title="Profile" sub="Account information and history"/><div className="grid"><Card className="span5" title="Information"><DetailList rows={[["Name","Yassine"],["Email","custmer@custmer.com"],["Role","Customer"]]}/></Card><Card className="span7" title="Recent activity"><DataTable columns={["ACTIVITY","AREA","STATUS"]} rows={[["Voice assistant","Calls","Available"],["Delivery orders","Account history","Available"],["Table reservations","Account history","Available"]]}/></Card></div></div>}
