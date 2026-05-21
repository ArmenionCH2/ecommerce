"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateMerchantProduct(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const action = String(formData.get("action") ?? "");

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "merchant" && profile.role !== "admin")) {
    redirect("/merchant/auth");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("merchant_id,is_active")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    redirect(`/merchant/dashboard?error=${encodeURIComponent("Product not found")}`);
  }

  const isAdmin = profile.role === "admin";
  const ownsProduct = product.merchant_id === user.id;
  if (!ownsProduct && !isAdmin) {
    redirect(`/merchant/dashboard?error=${encodeURIComponent("Not authorized")}`);
  }

  if (action === "toggleActive") {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", productId);

    if (error) {
      redirect(`/merchant/dashboard?error=${encodeURIComponent(error.message)}`);
    }

    const message = product.is_active ? "Product draft saved" : "Product activated";
    redirect(`/merchant/dashboard?success=${encodeURIComponent(message)}`);
  }

  if (action === "delete") {
    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      redirect(`/merchant/dashboard?error=${encodeURIComponent(error.message)}`);
    }

    redirect(`/merchant/dashboard?success=${encodeURIComponent("Product deleted")}`);
  }

  redirect(`/merchant/dashboard?error=${encodeURIComponent("Invalid action")}`);
}
