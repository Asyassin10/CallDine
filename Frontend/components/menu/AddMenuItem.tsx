"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AddMenuItem.module.css";

export function AddMenuItem({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/menu", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:form.get("name"), category:form.get("category"), price:Number(form.get("price")), image_url:form.get("image_url"), available:form.get("available") === "on" }) });
    setOpen(false);
    router.refresh();
  }

  return <><button className="button primary" onClick={() => setOpen(true)}>Add product</button>{open && <div className={styles.backdrop}><form className={styles.modal} onSubmit={submit}><div className={styles.heading}><h2>Add product</h2><button type="button" className="button" onClick={() => setOpen(false)}>Close</button></div><label>Name<input className="input" name="name" required /></label><label>Category<select className="input" name="category">{categories.map(category => <option key={category}>{category}</option>)}</select></label><label>Price (€)<input className="input" name="price" type="number" min="0" step="0.5" required /></label><label>Image URL<input className="input" name="image_url" type="url" required /></label><label className={styles.available}><input name="available" type="checkbox" defaultChecked /> Available</label><button className="button primary">Save product</button></form></div>}</>;
}
