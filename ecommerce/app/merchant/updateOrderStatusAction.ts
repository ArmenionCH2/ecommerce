"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateMerchantOrderStatus(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const status = String(formData.get("status") ?? "processing");

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "merchant") {
    redirect("/merchant/auth");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    redirect(`/merchant/orders?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/merchant/orders?success=Order%20status%20updated");
}
