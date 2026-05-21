"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function checkoutCart() {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("checkout_cart");
  if (error) {
    redirect(`/cart?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/orders?success=Order%20placed%20successfully");
}
