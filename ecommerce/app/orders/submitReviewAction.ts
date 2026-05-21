"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function submitReview(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("reviews").upsert({
    user_id: user.id,
    product_id: productId,
    rating,
    comment,
  }, { onConflict: "user_id,product_id" });

  if (error) {
    redirect(`/orders?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/orders?success=Review%20submitted");
}
