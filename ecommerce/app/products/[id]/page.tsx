import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { addToCart } from "../addToCartAction";

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
};

type ProductDetails = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  merchant_id: string | null;
};

async function getProduct(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`id,name,description,category,price,stock,image_url,merchant_id`)
    .eq("id", Number(id))
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ProductDetails;
}

async function getReviews(productId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id,rating,comment,created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Review[];
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) {
    return (
      <div className="min-h-screen bg-[#08110f] px-6 py-10 lg:px-10 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-600/30 bg-black/40 p-10 text-center">
          <h1 className="text-3xl font-bold">Product not found</h1>
          <p className="mt-3 text-gray-300">The product may no longer be available.</p>
          <Link href="/products" className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-500">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const reviews = await getReviews(product.id);

  return (
    <div className="min-h-screen bg-[#08110f] px-6 py-10 lg:px-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] bg-green-950/50 p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-green-300">{product.category || "General"}</p>
                  <h1 className="mt-4 text-4xl font-bold">{product.name}</h1>
                </div>
                <p className="text-3xl font-semibold text-white">${product.price.toFixed(2)}</p>
              </div>
              <p className="mt-6 text-gray-300">{product.description}</p>
              <p className="mt-4 text-sm text-gray-400">Stock: {product.stock}</p>
            </div>

            <div className="rounded-[1.75rem] border border-green-700/20 bg-slate-950/80 p-8">
              <h2 className="text-2xl font-semibold text-white">Customer reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-4 text-gray-300">Be the first to review this product after purchase.</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-3xl border border-green-700/20 bg-black/40 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-white">{review.rating} / 5</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-green-300">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="mt-3 text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6 rounded-[1.75rem] border border-green-700/20 bg-slate-950/80 p-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.24em] text-green-300">Shop</p>
              <p className="text-xl font-semibold text-white">Add to cart</p>
              <p className="text-gray-400">Quickly reserve this item and checkout from your cart.</p>
            </div>

            <form action={addToCart} className="space-y-4">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value={1} />
              <button type="submit" className="w-full rounded-full bg-green-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-green-500">
                Add to Cart
              </button>
            </form>

            <Link href="/cart" className="block rounded-full border border-green-500 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
              View Cart
            </Link>
          </aside>
        </section>
      </div>
    </div>
  );
}
