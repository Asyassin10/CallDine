import { slugify } from "./fixtures";
import type { MenuCategory, MenuItem } from "./types";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
type ApiMenuItem = {id:number;name:string;category:MenuCategory;price:number;image_url:string;available:boolean;stock_quantity:number};

export async function getMenu(): Promise<MenuItem[]> {
  const response = await fetch(`${backend}/api/v1/menu`, { cache:"no-store" });
  const items = await response.json() as ApiMenuItem[];
  return items.map(item => ({ id:String(item.id), name:item.name, slug:slugify(item.name), category:item.category, price:item.price, image:item.image_url, available:item.available, stock_quantity:item.stock_quantity }));
}

export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${backend}/api/v1/categories`, { cache:"no-store" });
  const categories = await response.json() as Array<{name:string}>;
  return categories.map(category => category.name);
}

export const menuCategories: Array<"All" | MenuCategory> = ["All","Starters","Pasta","Main courses","Seafood","Vegetarian","Sides","Desserts","Breakfast","Specials"];
