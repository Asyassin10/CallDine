import { redirect } from "next/navigation";

export default function CartPage() {
  redirect("/app/orders");
}
