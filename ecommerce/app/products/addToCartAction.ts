"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function addToCart(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity")) || 1;

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,stock,is_active")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product || !product.is_active) {
    redirect(`/products?error=${encodeURIComponent("Product not available")}`);
  }

  if (product.stock < quantity) {
    redirect(`/products?error=${encodeURIComponent("Not enough stock")}`);
  }

  const { error } = await supabase.from("cart_items").upsert(
    {
      user_id: user.id,
      product_id: productId,
      quantity,
    },
    { onConflict: "user_id,product_id" }
  );

  if (error) {
    redirect(`/products?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cart?success=Item%20added%20to%20cart");
}
