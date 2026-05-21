import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { becomeMerchant } from "../becomeMerchantAction";
import { redirect } from "next/navigation";
import FlashMessage from "@/app/components/FlashMessage";

async function getProfile() {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("role,shop_name").eq("id", user.id).maybeSingle();
  return profile;
}

export default async function MerchantAuthPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const profile = await getProfile();
  const errorMessage = searchParams?.error ? String(searchParams.error) : null;
  const successMessage = searchParams?.success ? String(searchParams.success) : null;

  if (profile?.role === "merchant" || profile?.role === "admin") {
    redirect("/merchant/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#08110f] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-green-700/30 bg-white/5 p-10 shadow-2xl shadow-black/20">
        <h1 className="text-4xl font-bold text-white">Become a Merchant</h1>
        <p className="mt-3 text-gray-300">Create a shop profile and start selling products in the marketplace.</p>

        <form action={becomeMerchant} className="mt-10 space-y-6">
          <FlashMessage type="error" message={errorMessage} />
          <FlashMessage type="success" message={successMessage} />
          <div>
            <label className="block text-sm font-semibold text-white">Shop Name</label>
            <input
              name="shopName"
              placeholder="Your shop name"
              className="mt-2 w-full rounded-3xl border border-green-600/40 bg-slate-950/90 px-4 py-3 text-white outline-none"
            />
          </div>
          <button type="submit" className="rounded-full bg-green-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-green-500">
            Start selling
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-400">
          <p>
            Already a merchant? <Link href="/merchant/dashboard" className="text-green-300 underline">Go to your dashboard</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
