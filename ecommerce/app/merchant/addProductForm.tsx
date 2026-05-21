"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function addMerchantProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  if (!name || !description || !category || Number.isNaN(price) || Number.isNaN(stock)) {
    redirect("/merchant/dashboard?error=Missing required fields");
  }

  const { error } = await supabase.from("products").insert({
    merchant_id: user.id,
    name,
    description,
    category,
    price,
    stock,
    image_url: imageUrl,
    is_active: true,
  });

  if (error) {
    redirect(`/merchant/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/merchant/dashboard?success=Product%20created");
}
