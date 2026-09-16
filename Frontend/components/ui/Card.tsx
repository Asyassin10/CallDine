import Link from "next/link";
export function Card({title,sub,children,className="",href}:{title?:string;sub?:string;children?:React.ReactNode;className?:string;href?:string}){
  const content=<>{title&&<h2 className="cardTitle">{title}</h2>}{sub&&<p className="cardSub">{sub}</p>}{children}</>;
  return href?<Link href={href} className={`card cardLink ${className}`}>{content}</Link>:<section className={`card ${className}`}>{content}</section>;
}
export function DetailList({rows}:{rows:Array<[string,React.ReactNode]>}){return <div className="detailList">{rows.map(([key,value])=><div className="detailRow" key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>}
export function Kpis({items}:{items:Array<[string,string,string]>}){return <div className="kpiGrid">{items.map(([label,value,meta])=><Card key={label}><div className="kpiLabel">{label}</div><div className="kpiValue">{value}</div><div className="kpiMeta">{meta}</div></Card>)}</div>}
