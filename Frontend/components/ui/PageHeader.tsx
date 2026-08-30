import Link from "next/link";
export function PageHeader({title,sub,eyebrow,back,children}:{title:string;sub?:string;eyebrow?:string;back?:string;children?:React.ReactNode}){
  return <header className="pageHeader"><div>{back&&<Link className="eyebrow" href={back}>← Back</Link>}<div className="eyebrow">{eyebrow}</div><h1 className="pageTitle">{title}</h1>{sub&&<div className="pageSub">{sub}</div>}</div>{children&&<div className="actions">{children}</div>}</header>;
}
