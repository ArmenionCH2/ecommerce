import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OrderSimulator } from "./orderSimulator";
import { submitReview } from "./submitReviewAction";
import FlashMessage from "@/app/components/FlashMessage";

type CartItem = {
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
};

type OrderWithItems = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    product: {
      name: string;
    };
  }>;
};

async function getOrders() {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`id,status,total,created_at,order_items(quantity,unit_price,product_id,product:products(name))`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  if (!orders) {
    return [];
  }

  return orders.map((order: any) => ({
    id: String(order.id),
    status: order.status,
    total: order.total,
    created_at: order.created_at,
    items: order.order_items.map((item: any) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product: {
        name: item.product?.name ?? "Unknown",
      },
    })),
  })) as OrderWithItems[];
}

export default async function OrdersPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const orders = await getOrders();
  const errorMessage = searchParams?.error ? String(searchParams.error) : null;
  const successMessage = searchParams?.success ? String(searchParams.success) : null;

  return (
    <div className="min-h-screen bg-[#08110f] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <h1 className="text-4xl font-bold text-white">Your Orders</h1>
          <p className="mt-3 text-gray-300">Track past purchases, delivery status, and submit reviews.</p>
        </section>
        <div className="space-y-4">
          <FlashMessage type="error" message={errorMessage} />
          <FlashMessage type="success" message={successMessage} />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.75fr_1fr]">
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="rounded-[1.75rem] border border-green-700/20 bg-slate-950/80 p-10 text-center text-gray-300">
                No orders yet. Start shopping and check out to see deliveries here.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-xl shadow-black/20">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-green-300">Order {order.id.slice(0, 8)}</p>
                      <p className="mt-2 text-lg font-semibold text-white">Total: ${order.total.toFixed(2)}</p>
                    </div>
                    <span className="rounded-full bg-green-600/15 px-4 py-2 text-sm text-green-200">{order.status}</span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="rounded-3xl border border-green-700/20 bg-slate-950/80 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">{item.product.name}</p>
                            <p className="text-sm text-gray-400">Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm text-green-200">${(item.unit_price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.status === "delivered" && (
                    <div className="mt-6 space-y-6 rounded-3xl border border-green-700/20 bg-slate-950/80 p-6">
                      <p className="text-sm text-gray-300">Leave reviews for delivered items.</p>
                      {order.items.map((item, itemIndex) => (
                        <form key={itemIndex} action={submitReview} className="space-y-4 rounded-3xl border border-green-600/20 bg-slate-950/90 p-4">
                          <input type="hidden" name="productId" value={item.product_id} />
                          <p className="text-sm font-semibold text-white">{item.product.name}</p>
                          <div>
                            <label className="text-sm text-gray-300">Rating</label>
                            <select name="rating" className="mt-2 w-full rounded-3xl border border-green-600/50 bg-slate-950/90 px-4 py-3 text-white outline-none">
                              {[5, 4, 3, 2, 1].map((rating) => (
                                <option key={rating} value={rating}>{rating} Stars</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-300">Review</label>
                            <textarea name="comment" rows={3} className="mt-2 w-full rounded-3xl border border-green-600/50 bg-slate-950/90 px-4 py-3 text-white outline-none" placeholder="Share your experience"></textarea>
                          </div>
                          <button type="submit" className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-500">
                            Submit review
                          </button>
                        </form>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <OrderSimulator
            orders={orders.map((order) => ({
              id: order.id,
              status: order.status,
              created_at: order.created_at,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
