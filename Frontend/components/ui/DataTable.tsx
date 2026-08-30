"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
export function DataTable({columns,rows,links}:{columns:string[];rows:Array<Array<React.ReactNode>>;links?:string[]}){
  const router=useRouter();
  const [search,setSearch]=useState("");
  const shown=rows.map((row,index)=>({row,index})).filter(({row})=>row.some(cell=>String(cell).toLowerCase().includes(search.toLowerCase())));
  return <><input className="input" style={{maxWidth:280,marginBottom:12}} value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search table..." aria-label="Search table"/><div className="tableWrap"><table className="table"><thead><tr>{columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{shown.map(({row,index})=><tr key={index} onClick={()=>links?.[index]&&router.push(links[index])} style={{cursor:links?.[index]?"pointer":undefined}}>{row.map((cell,j)=><td key={j}>{j===0&&links?.[index]?<Link href={links[index]} onClick={event=>event.stopPropagation()}><strong>{cell}</strong></Link>:typeof cell==="string"&&["Pending","Confirmed","Preparing","Ready","Completed","Cancelled","Seated","Successful","Failed","Available","Sold out"].includes(cell)?<StatusBadge value={cell}/>:cell}</td>)}</tr>)}{shown.length===0&&<tr><td colSpan={columns.length}>No matching results.</td></tr>}</tbody></table></div></>;
}
