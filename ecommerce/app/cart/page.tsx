import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { checkoutCart } from "./checkoutAction";
import { removeCartItem } from "./removeCartItemAction";
import { updateCartItem } from "./updateCartItemAction";
import { redirect } from "next/navigation";
import FlashMessage from "@/app/components/FlashMessage";

async function getCartItems() {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("quantity,product_id")
    .eq("user_id", user.id);

  if (cartError) {
    console.error(cartError);
    return [];
  }

  const productIds = cartItems?.map((item) => item.product_id) ?? [];
  if (productIds.length === 0) {
    return [];
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,name,price,stock,description")
    .in("id", productIds);

  if (productsError) {
    console.error(productsError);
    return [];
  }

  return cartItems.map((item) => {
    const product = products.find((product) => product.id === item.product_id);
    return {
      quantity: item.quantity,
      product,
    };
  });
}

export default async function CartPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const cartItems = await getCartItems();
  const total = cartItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
  const errorMessage = searchParams?.error ? String(searchParams.error) : null;
  const successMessage = searchParams?.success ? String(searchParams.success) : null;

  return (
    <div className="min-h-screen bg-[#08110f] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Your Cart</h1>
              <p className="mt-2 text-gray-300">Review your items before checkout.</p>
            </div>
            <Link href="/products" className="rounded-full border border-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Continue Shopping
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            <FlashMessage type="error" message={errorMessage} />
            <FlashMessage type="success" message={successMessage} />
          </div>

          {cartItems.length === 0 ? (
            <div className="mt-10 rounded-[1.75rem] border border-green-700/30 bg-green-950/20 p-12 text-center text-gray-300">
              Your cart is empty. Add products from the marketplace.
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="rounded-[1.75rem] border border-green-700/20 bg-slate-950/80 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <h2 className="text-xl font-semibold text-white">{item.product?.name ?? "Unknown product"}</h2>
                        <p className="text-sm text-gray-400">{item.product?.description}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm text-green-300">${item.product?.price?.toFixed(2)} each</span>
                          <span className="text-sm text-gray-400">Stock: {item.product?.stock}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 text-right">
                        <p className="text-white/90">Subtotal: ${(item.product?.price ?? 0 * item.quantity).toFixed(2)}</p>
                        <form action={updateCartItem} className="flex items-center justify-end gap-2">
                          <input type="hidden" name="productId" value={item.product?.id} />
                          <input
                            name="quantity"
                            min={1}
                            defaultValue={item.quantity}
                            type="number"
                            className="w-20 rounded-full border border-green-600/40 bg-slate-950/90 px-3 py-2 text-white outline-none"
                          />
                          <button type="submit" className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500">
                            Update
                          </button>
                        </form>
                        <form action={removeCartItem}>
                          <input type="hidden" name="productId" value={item.product?.id} />
                          <button type="submit" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.75rem] border border-green-700/20 bg-slate-950/80 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-green-300">Order total</p>
                    <p className="text-3xl font-bold text-white">${total.toFixed(2)}</p>
                  </div>
                  <form action={checkoutCart} className="w-full sm:w-auto">
                    <button type="submit" className="w-full rounded-full bg-green-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-green-500 sm:w-auto">
                      Checkout now
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
