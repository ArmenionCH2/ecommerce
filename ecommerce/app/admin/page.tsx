import Link from "next/link";
import AddProductForm from "./addProductForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("id,name,price,stock");
  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

async function getMetrics() {
  const supabase = await createClient();
  const productsRes = await supabase.from("products").select("id", { count: "exact", head: true });
  const ordersRes = await supabase.from("orders").select("id", { count: "exact", head: true });
  const merchantsRes = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "merchant");

  const { data: ordersData } = await supabase.from("orders").select("total");
  const totalRevenue = (ordersData ?? []).reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  return {
    products: Number(productsRes.count ?? 0),
    orders: Number(ordersRes.count ?? 0),
    merchants: Number(merchantsRes.count ?? 0),
    revenue: totalRevenue,
  };
}

export default async function AdminPage() {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const products = await getProducts();
  const metrics = await getMetrics();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-gray-400">Manage products, stock, users, and marketplace metrics.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white">View Shop</Link>
            <Link href="/admin/users" className="rounded-full border border-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Manage Users</Link>
            <Link href="/admin/orders" className="rounded-full border border-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Manage Orders</Link>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-green-700 bg-green-950/30 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.24em] text-green-300">Products</p>
            <p className="mt-3 text-4xl font-semibold text-white">{metrics.products}</p>
          </div>
          <div className="rounded-3xl border border-green-700 bg-green-950/30 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.24em] text-green-300">Orders</p>
            <p className="mt-3 text-4xl font-semibold text-white">{metrics.orders}</p>
          </div>
          <div className="rounded-3xl border border-green-700 bg-green-950/30 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.24em] text-green-300">Merchants</p>
            <p className="mt-3 text-4xl font-semibold text-white">{metrics.merchants}</p>
          </div>
          <div className="rounded-3xl border border-green-700 bg-green-950/30 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.24em] text-green-300">Revenue</p>
            <p className="mt-3 text-4xl font-semibold text-white">${metrics.revenue.toFixed(2)}</p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-green-700 bg-green-950/30 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-6 text-2xl font-semibold">Products</h2>
            <div className="overflow-x-auto rounded-3xl border border-green-700/50 bg-black/30">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-green-700/50 text-green-200/90">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-green-700/20 hover:bg-white/5">
                      <td className="px-4 py-4">{product.name}</td>
                      <td className="px-4 py-4">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-4">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="p-6 text-gray-300">No products available. Add a product using the form.</div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-green-700 bg-green-950/30 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-6 text-2xl font-semibold">Add Product</h2>
            <AddProductForm />
          </div>
        </div>
      </div>
    </div>
  );
}
