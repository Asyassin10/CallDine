/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useState } from "react";
import { euro } from "@/lib/fixtures";
import { menuCategories } from "@/lib/menu";
import type { MenuItem } from "@/lib/types";
import styles from "./Menu.module.css";

const fallback="https://www.themealdb.com/images/media/meals/1549542994.jpg";
export function MenuGrid({items}:{items:MenuItem[]}){
  const [category,setCategory]=useState<(typeof menuCategories)[number]>("All");
  const shown=category==="All"?items:items.filter(item=>item.category===category);
  return <><div className="tabs" role="tablist">{menuCategories.map(item=><button role="tab" aria-selected={category===item} className={`tab ${category===item?"active":""}`} key={item} onClick={()=>setCategory(item)}>{item}</button>)}</div><div className={styles.grid}>{shown.map(item=><Link href={`/app/menu/${item.slug}`} className={styles.card} key={item.id}><div className={styles.imageWrap}><img className={styles.image} src={item.image} alt={item.name} onError={event=>{event.currentTarget.src=fallback}}/></div><div className={styles.meta}><div><div className={styles.name}>{item.name}</div><div className={styles.source}>{item.category}</div></div><span className={styles.price}>{euro(item.price)}</span></div></Link>)}</div>{shown.length===0&&<div className="empty">No dishes in this category.</div>}</>
}
