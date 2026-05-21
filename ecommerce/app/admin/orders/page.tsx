import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateOrderStatus } from "../updateOrderStatusAction";
import FlashMessage from "@/app/components/FlashMessage";

type OrderWithCustomer = {
  id: number;
  status: string;
  total: number;
  created_at: string;
  user_id: string;
};

async function getOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id,status,total,created_at,user_id")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as OrderWithCustomer[];
}

export default async function AdminOrdersPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const errorMessage = searchParams?.error ? String(searchParams.error) : null;
  const successMessage = searchParams?.success ? String(searchParams.success) : null;
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Order Management</h1>
            <p className="text-gray-400">Review and update marketplace order statuses.</p>
          </div>
          <Link href="/admin" className="rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white">Back to Admin</Link>
        </div>
        <div className="mb-6 space-y-4">
          <FlashMessage type="error" message={errorMessage} />
          <FlashMessage type="success" message={successMessage} />
        </div>

        <div className="rounded-3xl border border-green-700 bg-green-950/30 p-6 shadow-xl shadow-black/20">
          <div className="overflow-x-auto rounded-3xl border border-green-700/50 bg-black/30">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-green-700/50 text-green-200/90">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-green-700/20 hover:bg-white/5">
                    <td className="px-4 py-4">#{order.id}</td>
                    <td className="px-4 py-4 text-xs text-green-200">{order.user_id.slice(0, 8)}</td>
                    <td className="px-4 py-4">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-4">{order.status}</td>
                    <td className="px-4 py-4">
                      <form action={updateOrderStatus} className="flex flex-wrap gap-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        {[
                          { value: "placed", label: "Placed" },
                          { value: "processing", label: "Processing" },
                          { value: "delivered", label: "Delivered" },
                        ].map((option) => (
                          <button key={option.value} name="status" value={option.value} className="rounded-full border border-green-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                            {option.label}
                          </button>
                        ))}
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
