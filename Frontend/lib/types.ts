export type SessionRole = "customer" | "admin";

export type MenuCategory =
  | "Starters" | "Pasta" | "Main courses" | "Seafood" | "Vegetarian"
  | "Sides" | "Desserts" | "Breakfast" | "Specials";

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  category: MenuCategory;
  price: number;
  image: string;
  available: boolean;
}

export interface Order {
  id: string; customer: string; source: "Voice" | "Chat" | "Website";
  status: "Pending" | "Confirmed" | "Preparing" | "Ready" | "Completed" | "Cancelled";
  total: number; placed: string; items: number;
}

export interface Reservation {
  id: string; guest: string; when: string; guests: number; table: string;
  status: "Confirmed" | "Seated" | "Cancelled";
}

export interface CallRecord {
  id: string; customer: string; date: string; duration: string; intent: string;
  result: "Successful" | "Failed"; order?: string; reservation?: string;
}

export interface Customer {
  id: string; name: string; orders: number; reservations: number; spent: number; lastActivity: string;
}
