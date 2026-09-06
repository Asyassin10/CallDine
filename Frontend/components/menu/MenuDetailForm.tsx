"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/fixtures";
import type { MenuItem } from "@/lib/types";
import { uploadMenuImage } from "./uploadMenuImage";

export function MenuDetailForm({ item, categories }: { item: MenuItem; categories: string[] }) {
  const router = useRouter();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const image_url = await uploadMenuImage(form.get("image"), item.image);
    await fetch(`/api/menu/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), category: form.get("category"), price: Number(form.get("price")), description: form.get("description"), image_url, available: form.get("available") === "on", stock_quantity: item.stock_quantity }) });
    router.replace(`/admin/menu/${slugify(String(form.get("name")))}`);
    router.refresh();
  }

  return <form className="card" onSubmit={save}><h2 className="cardTitle">Product</h2><div className="formGrid" style={{ marginTop: 14 }}><div className="field"><label>Name</label><input className="input" name="name" defaultValue={item.name} required /></div><div className="field"><label>Category</label><select className="input" name="category" defaultValue={item.category}>{categories.map(category => <option key={category}>{category}</option>)}</select></div><div className="field"><label>Price (€)</label><input className="input" name="price" type="number" min="0" step="0.5" defaultValue={item.price} required /></div><div className="field"><label>Availability</label><input name="available" type="checkbox" defaultChecked={item.available} /></div><div className="field wide"><label>Description</label><textarea className="input" name="description" rows={3} defaultValue={item.description} required /></div><div className="field wide"><label>Replace image (optional)</label><input className="input" name="image" type="file" accept="image/*" /></div></div><button className="button primary" style={{ marginTop: 14 }}>Save changes</button></form>;
}
