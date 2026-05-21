import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { addMerchantProduct } from "../addProductForm";
import { updateMerchantProduct } from "../updateProductAction";
import FlashMessage from "@/app/components/FlashMessage";

async function getMerchantProfile() {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase.from("profiles").select("role,shop_name").eq("id", user.id).maybeSingle();
  if (error) {
    console.error(error);
  }
  return profile;
}

async function getMerchantProducts() {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,stock,category,is_active")
    .eq("merchant_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export default async function MerchantDashboardPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const profile = await getMerchantProfile();

  if (!profile) {
    redirect("/merchant/auth");
  }
  const errorMessage = searchParams?.error ? String(searchParams.error) : null;
  const successMessage = searchParams?.success ? String(searchParams.success) : null;

  if (profile.role !== "merchant" && profile.role !== "admin") {
    redirect("/merchant/auth");
  }

  const products = await getMerchantProducts();

  return (
    <div className="min-h-screen bg-[#08110f] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Merchant Dashboard</h1>
              <p className="mt-2 text-gray-300">Manage your shop and inventory from one place.</p>
            </div>
            <div className="rounded-full border border-green-500/40 px-5 py-3 text-sm text-green-200">{profile.shop_name}</div>
          </div>
        </section>
        <div className="space-y-4">
          <FlashMessage type="error" message={errorMessage} />
          <FlashMessage type="success" message={successMessage} />
        </div>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-xl shadow-black/20">
          <div>
            <h2 className="text-2xl font-semibold text-white">Merchant tools</h2>
            <p className="mt-2 text-gray-300">Manage inventory and review orders containing your products.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/merchant/orders" className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-500">
              View sales
            </a>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.4fr_0.85fr]">
          <div className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">Your products</h2>
            <div className="mt-6 space-y-4">
              {products.length === 0 ? (
                <div className="rounded-3xl border border-green-700/20 bg-slate-950/80 p-8 text-gray-300">
                  No products yet. Add your first product below.
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="rounded-3xl border border-green-700/20 bg-slate-950/80 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-sm text-gray-400">{product.category}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                        <span>${Number(product.price).toFixed(2)}</span>
                        <span>Stock: {product.stock}</span>
                        <span>{product.is_active ? "Active" : "Draft"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">Add new product</h2>
            <form action={addMerchantProduct} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input name="name" className="mt-2 w-full rounded-3xl border border-green-600/40 bg-slate-950/90 px-4 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <input name="category" className="mt-2 w-full rounded-3xl border border-green-600/40 bg-slate-950/90 px-4 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Price</label>
                <input name="price" type="number" step="0.01" className="mt-2 w-full rounded-3xl border border-green-600/40 bg-slate-950/90 px-4 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Stock</label>
                <input name="stock" type="number" className="mt-2 w-full rounded-3xl border border-green-600/40 bg-slate-950/90 px-4 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Image URL</label>
                <input name="imageUrl" className="mt-2 w-full rounded-3xl border border-green-600/40 bg-slate-950/90 px-4 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea name="description" rows={4} className="mt-2 w-full rounded-3xl border border-green-600/40 bg-slate-950/90 px-4 py-3 text-white outline-none" />
              </div>
              <button type="submit" className="w-full rounded-full bg-green-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-green-500">
                Create product
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
