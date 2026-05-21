import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateMerchantOrderStatus } from "../updateOrderStatusAction";
import FlashMessage from "@/app/components/FlashMessage";

type OrderItemRow = {
  order_id: number;
  quantity: number;
  unit_price: number;
  product: { name: string }[];
  order: {
    id: number;
    status: string;
    total: number;
    created_at: string;
    user_id: string;
  }[];
};

type MerchantOrder = {
  id: number;
  status: string;
  total: number;
  created_at: string;
  customer_id: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit_price: number;
  }>;
};

async function getMerchantOrders() {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("order_items")
    .select(`order_id,quantity,unit_price,product:products(name),order:orders(id,status,total,created_at,user_id)`)
    .eq("merchant_id", user.id)
    .order("order_id", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  const grouped = (data ?? []).reduce<Record<number, MerchantOrder>>((acc, row: OrderItemRow) => {
    const orderRecord = row.order?.[0];
    const productRecord = row.product?.[0];
    if (!orderRecord) return acc;

    const orderId = row.order_id;
    if (!acc[orderId]) {
      acc[orderId] = {
        id: orderRecord.id,
        status: orderRecord.status,
        total: Number(orderRecord.total),
        created_at: orderRecord.created_at,
        customer_id: orderRecord.user_id,
        items: [],
      };
    }

    acc[orderId].items.push({
      productName: productRecord?.name ?? "Unknown product",
      quantity: row.quantity,
      unit_price: Number(row.unit_price),
    });

    return acc;
  }, {});

  return Object.values(grouped);
}

export default async function MerchantOrdersPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const orders = await getMerchantOrders();
  const errorMessage = searchParams?.error ? String(searchParams.error) : null;
  const successMessage = searchParams?.success ? String(searchParams.success) : null;

  return (
    <div className="min-h-screen bg-[#08110f] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <h1 className="text-4xl font-bold text-white">Merchant Sales</h1>
          <p className="mt-3 text-gray-300">Review orders containing your products and track seller revenue.</p>
        </section>
        <div className="space-y-4">
          <FlashMessage type="error" message={errorMessage} />
          <FlashMessage type="success" message={successMessage} />
        </div>

        {orders.length === 0 ? (
          <div className="rounded-[2rem] border border-green-700/30 bg-slate-950/80 p-10 text-center text-gray-300">
            No sales yet. Add products to the marketplace to start receiving orders.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[2rem] border border-green-700/30 bg-white/5 p-8 shadow-xl shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-green-300">Order {order.id}</p>
                    <p className="mt-2 text-lg font-semibold text-white">${order.total.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <span className="inline-flex rounded-full bg-green-600/10 px-4 py-2 text-sm text-green-200">{order.status}</span>
                    <p className="text-sm text-gray-400">Placed {new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-400">Customer {order.customer_id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="rounded-3xl border border-green-700/20 bg-slate-950/80 p-4">
                      <p className="font-semibold text-white">{item.productName}</p>
                      <p className="text-sm text-gray-400">Qty {item.quantity}</p>
                      <p className="mt-2 text-sm text-green-200">Revenue ${ (item.unit_price * item.quantity).toFixed(2) }</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <form action={updateMerchantOrderStatus} className="flex flex-wrap gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    {[
                      { value: "processing", label: "Mark Processing" },
                      { value: "delivered", label: "Mark Delivered" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        name="status"
                        value={option.value}
                        className="rounded-full border border-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        {option.label}
                      </button>
                    ))}
                  </form>
                  <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">Current status: {order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
