import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { buyProduct } from "./buyAction";

async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("id,name,price,stock,description");

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Shop Products</h1>
            <p className="text-gray-300 mt-2">Browse available products and stock levels.</p>
          </div>
          <Link href="/login" className="rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white">
            Sign In
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-green-700 bg-green-950/20 p-10 text-center text-gray-300">
            No products found. Please add products from the admin panel.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-3xl border border-green-700 bg-green-950/20 p-6 shadow-lg shadow-black/20">
                <div className="mb-4 h-36 rounded-3xl bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center text-xl font-semibold">
                  {product.name}
                </div>
                <p className="text-gray-300 mb-4">{product.description}</p>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-green-300">Stock: {product.stock}</span>
                </div>

                <form action={buyProduct} className="mt-6">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="quantity" value={1} />
                  <button type="submit" className="w-full rounded-full bg-green-600 px-4 py-3 text-sm font-semibold transition hover:bg-green-500">
                    Buy Now
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
