"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AddProductForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = createClient();

    const { error } = await supabase.from("products").insert([{ name, price, stock, description }]);
    if (error) {
      setMessage(error.message);
      return;
    }

    setName("");
    setPrice(0);
    setStock(0);
    setDescription("");
    setMessage("Product added successfully.");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white">
      <label className="flex flex-col gap-2 text-sm text-gray-200">
        Product Name
        <input
          className="rounded-2xl border border-green-600 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-green-400"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Classic Hoodie"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-gray-200">
        Price
        <input
          className="rounded-2xl border border-green-600 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-green-400"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-gray-200">
        Stock
        <input
          className="rounded-2xl border border-green-600 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-green-400"
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(event) => setStock(Number(event.target.value))}
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-gray-200">
        Description
        <textarea
          className="rounded-2xl border border-green-600 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-green-400"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Soft hoodie with logo"
          rows={4}
          required
        />
      </label>
      <button type="submit" className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold transition hover:bg-green-500">
        Add Product
      </button>
      {message && <p className="text-sm text-green-200">{message}</p>}
    </form>
  );
}
