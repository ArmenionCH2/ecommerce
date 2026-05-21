"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function buyProduct(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity")) || 1;

  const supabase = await createClient();

  // get current user
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  // load profile and product
  const [{ data: profile }, { data: productResp }] = await Promise.all([
    supabase.from("profiles").select("id,role,balance").eq("id", user!.id).maybeSingle(),
    supabase.from("products").select("id,name,price,stock").eq("id", productId).maybeSingle(),
  ]);

  if (!productResp) {
    redirect(`/products?error=${encodeURIComponent("Product not found")}`);
  }

  const product = productResp as any;

  if (product.stock < quantity) {
    redirect(`/products?error=${encodeURIComponent("Not enough stock")}`);
  }

  const total = Number(product.price) * quantity;

  const userBalance = Number(profile?.balance ?? 0);
  if (userBalance < total) {
    redirect(`/products?error=${encodeURIComponent("Insufficient balance")}`);
  }

  // create order
  const { data: order, error: orderError } = await supabase.from("orders").insert([{ user_id: user!.id, status: 'paid', total }]).select("id").maybeSingle();
  if (orderError || !order) {
    redirect(`/products?error=${encodeURIComponent(orderError?.message ?? 'Order failed')}`);
  }

  const { error: itemErr } = await supabase.from("order_items").insert([{ order_id: order.id, product_id: productId, quantity, unit_price: product.price }]);
  if (itemErr) {
    redirect(`/products?error=${encodeURIComponent(itemErr.message)}`);
  }

  // decrement stock and deduct balance
  await supabase.from("products").update({ stock: product.stock - quantity }).eq("id", productId);
  await supabase.from("profiles").update({ balance: userBalance - total }).eq("id", user!.id);

  redirect(`/products?success=${encodeURIComponent("Purchase completed")}`);
}
