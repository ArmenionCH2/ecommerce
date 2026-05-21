"use client";

import { useEffect, useMemo, useState } from "react";

interface OrderSummary {
  id: string;
  status: string;
  created_at: string;
}

export function OrderSimulator({ orders }: { orders: OrderSummary[] }) {
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialStatus = orders.reduce<Record<string, string>>((acc, order) => {
      acc[order.id] = order.status;
      return acc;
    }, {});
    setStatusMap(initialStatus);
  }, [orders]);

  useEffect(() => {
    const timers = orders.map((order) => {
      const nextStatus = order.status === "pending" ? "processing" : order.status === "processing" ? "delivered" : order.status;
      return window.setTimeout(() => {
        setStatusMap((current) => ({ ...current, [order.id]: nextStatus }));
      }, 3500);
    });

    return () => timers.forEach(clearTimeout);
  }, [orders]);

  const deliveredOrders = useMemo(
    () => orders.filter((order) => statusMap[order.id] === "delivered"),
    [orders, statusMap]
  );

  return (
    <div className="rounded-[2rem] border border-green-700/30 bg-white/5 p-6 text-white shadow-xl shadow-black/20">
      <h2 className="text-xl font-semibold">Delivery simulation</h2>
      <p className="mt-2 text-sm text-gray-400">Your orders progress through fulfillment automatically.</p>
      <div className="mt-5 space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between rounded-3xl border border-green-700/20 bg-slate-950/80 p-4">
            <div>
              <p className="font-semibold">Order {order.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-400">Placed {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <span className="rounded-full bg-green-600/20 px-4 py-2 text-sm text-green-200">{statusMap[order.id] || order.status}</span>
          </div>
        ))}
      </div>
      {deliveredOrders.length > 0 && (
        <p className="mt-4 text-sm text-green-300">Delivered orders are eligible for review.</p>
      )}
    </div>
  );
}
