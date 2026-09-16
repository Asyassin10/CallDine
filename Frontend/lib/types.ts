export type SessionRole = "customer" | "admin";

export type MenuCategory =
  | "Starters" | "Pasta" | "Main courses" | "Seafood" | "Vegetarian"
  | "Sides" | "Desserts" | "Breakfast" | "Boissons";

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  category: MenuCategory;
  price: number;
  description: string;
  image: string;
  available: boolean;
  stock_quantity: number;
}

export interface Customer {
  id: string; name: string; orders: number; reservations: number; spent: number; lastActivity: string;
}
