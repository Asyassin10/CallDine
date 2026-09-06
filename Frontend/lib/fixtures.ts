import type { CallRecord, Customer, MenuItem, Order, Reservation } from "./types";

export const orders: Order[] = [
  { id:"1832", customer:"Customer #182", source:"Voice", status:"Preparing", total:38.5, placed:"30 Aug 2026 · 19:42", items:2 },
  { id:"1831", customer:"Lena Fischer", source:"Website", status:"Ready", total:24, placed:"30 Aug 2026 · 19:28", items:1 },
  { id:"1830", customer:"Customer #164", source:"Chat", status:"Confirmed", total:52.2, placed:"30 Aug 2026 · 19:15", items:4 },
  { id:"1829", customer:"Tomas Reiter", source:"Voice", status:"Pending", total:19, placed:"30 Aug 2026 · 19:07", items:1 },
  { id:"1828", customer:"Mara Ansel", source:"Voice", status:"Completed", total:47, placed:"30 Aug 2026 · 18:52", items:3 },
  { id:"1827", customer:"Customer #151", source:"Website", status:"Completed", total:31.4, placed:"30 Aug 2026 · 18:33", items:2 },
  { id:"1826", customer:"Jonas Weber", source:"Chat", status:"Cancelled", total:22, placed:"30 Aug 2026 · 18:11", items:1 },
];

export const reservations: Reservation[] = [
  { id:"442", guest:"Lena Fischer", when:"30 Aug 2026 · 20:30", guests:4, table:"T7 · window", status:"Confirmed" },
  { id:"441", guest:"Customer #164", when:"30 Aug 2026 · 21:00", guests:2, table:"T3", status:"Confirmed" },
  { id:"440", guest:"Mara Ansel", when:"30 Aug 2026 · 20:30", guests:4, table:"T7 · window", status:"Seated" },
  { id:"439", guest:"Tomas Reiter", when:"31 Aug 2026 · 19:00", guests:6, table:"T12 · terrace", status:"Confirmed" },
];

export const calls: CallRecord[] = [
  { id:"8291", customer:"Customer #182", date:"Today 19:38", duration:"04:21", intent:"Food Order", result:"Successful", order:"1832" },
  { id:"8290", customer:"Lena Fischer", date:"Today 19:12", duration:"02:48", intent:"Table Reservation", result:"Successful", reservation:"442" },
  { id:"8289", customer:"Customer #164", date:"Today 18:57", duration:"05:03", intent:"Food Order", result:"Successful", order:"1830" },
  { id:"8288", customer:"Tomas Reiter", date:"Today 18:40", duration:"01:12", intent:"Menu Question", result:"Successful" },
  { id:"8287", customer:"Customer #151", date:"Today 18:22", duration:"03:35", intent:"Order Status", result:"Successful" },
  { id:"8286", customer:"Jonas Weber", date:"Today 17:58", duration:"00:46", intent:"Food Order", result:"Failed" },
];

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
