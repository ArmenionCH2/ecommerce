"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function removeCartItem(formData: FormData) {
  const productId = Number(formData.get("productId"));

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
  if (error) {
    redirect(`/cart?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cart?success=Item%20removed%20from%20cart");
}
