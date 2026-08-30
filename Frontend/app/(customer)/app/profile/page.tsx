import { Card, DetailList } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
export default function ProfilePage(){return <div className="page"><PageHeader eyebrow="Account" title="Profile" sub="Account information and history"/><div className="grid"><Card className="span5" title="Information"><DetailList rows={[["Name","Mara Ansel"],["Email","mara@ansel.co"],["Phone","+49 171 552 98"],["Member since","March 2024"]]}/></Card><Card className="span7" title="Recent activity"><DataTable columns={["ACTIVITY","DATE","STATUS"]} rows={[["Order #1832","Today 19:42","Preparing"],["Reservation #442","Today 19:38","Confirmed"],["Voice call #8291","Today 19:38","Successful"]]}/></Card></div></div>}
