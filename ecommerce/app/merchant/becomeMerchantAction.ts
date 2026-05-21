"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function becomeMerchant(formData: FormData) {
  const shopName = String(formData.get("shopName") ?? "").trim();
  if (!shopName) {
    redirect("/merchant/auth?error=Shop name is required");
  }

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "merchant", shop_name: shopName })
    .eq("id", user.id);

  if (error) {
    redirect(`/merchant/auth?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/merchant/dashboard?success=Merchant%20profile%20created");
}
