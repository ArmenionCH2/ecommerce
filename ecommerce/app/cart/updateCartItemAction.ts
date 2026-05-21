"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateCartItem(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity")) || 1;

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  if (quantity < 1) {
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
    redirect("/cart?success=Item%20removed%20from%20cart");
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    redirect(`/cart?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cart?success=Cart%20updated");
}
