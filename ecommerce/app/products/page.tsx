import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { addToCart } from "./addToCartAction";
import FlashMessage from "@/app/components/FlashMessage";

async function getProducts(search: string | null) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`id,merchant_id,name,description,category,price,stock,is_active`)
    .eq("is_active", true);

  if (search) {
    query = query.ilike("name", `%${search}%`).or(`category.ilike.%${search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export default async function ProductsPage({ searchParams }: { searchParams: { q?: string; error?: string; success?: string } }) {
  const products = await getProducts(searchParams.q ?? null);
  const errorMessage = searchParams.error ? String(searchParams.error) : null;
  const successMessage = searchParams.success ? String(searchParams.success) : null;

  return (
    <div className="min-h-screen bg-[#08110f] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Marketplace</h1>
              <p className="mt-2 text-gray-300">Browse products, add to cart, and checkout with instant delivery.</p>
            </div>
            <form className="flex w-full max-w-md gap-3 md:w-auto" action="/products">
              <input
                name="q"
                placeholder="Search products or category"
                className="w-full rounded-3xl border border-green-500/40 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-green-300"
              />
              <button type="submit" className="rounded-3xl bg-green-600 px-5 py-3 text-sm font-semibold transition hover:bg-green-500">
                Search
              </button>
            </form>
          </div>
        </section>
        <FlashMessage type="error" message={errorMessage} />
        <FlashMessage type="success" message={successMessage} />

        <div className="grid gap-6 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-[2rem] border border-green-700/30 bg-white/5 p-6 shadow-xl shadow-black/20">
              <div className="mb-5 h-56 rounded-[1.75rem] bg-gradient-to-br from-green-800 to-green-950 p-6 text-white">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.3em] text-green-200">{product.category || "General"}</span>
                  </div>
                  <div className="space-y-4">
                    <Link href={`/products/${product.id}`} className="text-2xl font-semibold hover:text-green-200">{product.name}</Link>
                    <p className="text-sm text-gray-300 line-clamp-3">{product.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-white/90">
                <div>
                  <p className="text-xl font-bold">${Number(product.price).toFixed(2)}</p>
                  <p className="text-sm text-gray-400">Stock: {product.stock}</p>
                </div>
                <form action={addToCart} className="min-w-[140px]">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="quantity" value={1} />
                  <button type="submit" className="w-full rounded-full bg-green-600 px-4 py-3 text-sm font-semibold transition hover:bg-green-500">
                    Add to Cart
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-end">
          <Link href="/cart" className="rounded-full border border-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
