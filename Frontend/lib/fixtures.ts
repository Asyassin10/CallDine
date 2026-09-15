import type { Customer, MenuItem } from "./types";

export const customers: Customer[] = [
  { id:"182", name:"Mara Ansel", orders:24, reservations:6, spent:1148, lastActivity:"Today 19:38" },
  { id:"181", name:"Lena Fischer", orders:18, reservations:9, spent:982, lastActivity:"Today 19:12" },
  { id:"164", name:"Customer #164", orders:11, reservations:2, spent:604, lastActivity:"Today 18:57" },
  { id:"151", name:"Tomas Reiter", orders:7, reservations:4, spent:389, lastActivity:"Today 18:40" },
  { id:"147", name:"Jonas Weber", orders:3, reservations:0, spent:96, lastActivity:"Yesterday" },
];

export const fallbackMenu: MenuItem[] = [
  ["Truffle tagliatelle","Pasta",24,"https://images.unsplash.com/photo-1642354609876-5386fea5e7fc?auto=format&fit=crop&w=900&q=80"],
  ["Burrata, heirloom tomato","Starters",14,"https://images.unsplash.com/photo-1649400454485-b8ad827f929d?auto=format&fit=crop&w=900&q=80"],
  ["Margherita Verace","Main courses",13.5,"https://images.unsplash.com/photo-1664309641932-0e03e0771b97?auto=format&fit=crop&w=900&q=80"],
  ["Diavola","Main courses",15,"https://images.unsplash.com/photo-1655562378704-d5d0a8c3d442?auto=format&fit=crop&w=900&q=80"],
  ["Garlic bread","Sides",6,"https://www.themealdb.com/images/media/meals/1529444830.jpg"],
  ["Tiramisù","Desserts",9,"https://www.themealdb.com/images/media/meals/wkhg581762773124.jpg"],
  ["Gnocchi al pesto","Pasta",19.5,"https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=80"],
  ["Insalata Caprese","Vegetarian",12.5,"https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=900&q=80"],
].map(([name,category,price,image],index)=>({id:`fallback-${index}`,name:String(name),slug:slugify(String(name)),category:category as MenuItem["category"],price:Number(price),description:"Freshly prepared with carefully selected ingredients.",image:String(image),available:name!=="Tiramisù",stock_quantity:20}));

export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const euro = (value: number) => new Intl.NumberFormat("de-DE", { style:"currency", currency:"EUR" }).format(value);
