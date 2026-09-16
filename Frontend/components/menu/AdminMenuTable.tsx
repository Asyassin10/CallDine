/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { euro } from "@/lib/fixtures";
import type { MenuItem } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { MenuActions } from "./MenuActions";

export function AdminMenuTable({ items, categories }: { items: MenuItem[]; categories: string[] }) {
  const [active, setActive] = useState("All");
  const shown = active === "All" ? items : items.filter(item => item.category === active);
  return <>
    <div className="tabs" role="tablist">
      {["All", ...categories].map(category => <button type="button" role="tab" aria-selected={active === category} className={`tab ${active === category ? "active" : ""}`} key={category} onClick={() => setActive(category)}>{category}</button>)}
    </div>
    <DataTable
      columns={["PRODUCT", "IMAGE", "CATEGORY", "PRICE", "STOCK", "AVAILABILITY", "ACTIONS"]}
      rows={shown.map(item => [item.name, <img className="menuThumb" key={`${item.id}-image`} src={item.image} alt="" />, item.category, euro(item.price), item.stock_quantity, item.available ? "Available" : "Sold out", <MenuActions key={item.id} item={item} categories={categories} />])}
      links={shown.map(item => `/admin/menu/${item.slug}`)}
    />
  </>;
}
