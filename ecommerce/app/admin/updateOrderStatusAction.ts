"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateOrderStatus(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const status = String(formData.get("status") ?? "placed");

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) {
    redirect(`/admin/orders?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/orders?success=Order%20status%20updated");
}
