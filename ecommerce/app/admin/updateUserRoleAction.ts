"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateUserRole(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "customer");

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

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/users?success=Role%20updated");
}
