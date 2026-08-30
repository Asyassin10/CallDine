"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem } from "@/lib/types";
import styles from "./AddMenuItem.module.css";

export function MenuActions({ item, categories }: { item: MenuItem; categories: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch(`/api/menu/${item.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:form.get("name"), category:form.get("category"), price:Number(form.get("price")), image_url:form.get("image_url"), available:form.get("available") === "on", stock_quantity:Number(form.get("stock_quantity")) }) });
    setOpen(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    await fetch(`/api/menu/${item.id}`, { method:"DELETE" });
    router.refresh();
  }

  return <><span className={styles.actions} onClick={event=>event.stopPropagation()}><button className="button" onClick={() => setOpen(true)}>Edit</button><button className={`${styles.danger} button`} onClick={remove}>Delete</button></span>{open && <div className={styles.backdrop}><form className={styles.modal} onSubmit={update}><div className={styles.heading}><h2>Edit product</h2><button type="button" className="button" onClick={() => setOpen(false)}>Close</button></div><label>Name<input className="input" name="name" defaultValue={item.name} required /></label><label>Category<select className="input" name="category" defaultValue={item.category}>{categories.map(category => <option key={category}>{category}</option>)}</select></label><label>Price (€)<input className="input" name="price" type="number" min="0" step="0.5" defaultValue={item.price} required /></label><label>Stock quantity<input className="input" name="stock_quantity" type="number" min="0" defaultValue={item.stock_quantity} required /></label><label>Image URL<input className="input" name="image_url" type="url" defaultValue={item.image} required /></label><label className={styles.available}><input name="available" type="checkbox" defaultChecked={item.available} /> Available</label><button className="button primary">Save changes</button></form></div>}</>;
}
