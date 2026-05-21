import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_35%),linear-gradient(180deg,_#07110f,_#031517)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <div className="rounded-[2rem] border border-green-500/40 bg-black/40 p-10 shadow-2xl shadow-black/40">
          <h1 className="text-5xl font-black tracking-tight">Ecommerce Starter</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            A simple store with signup/signin, a shop page, and a product admin panel.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/products" className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-500">
              Shop Products
            </Link>
            <Link href="/admin" className="rounded-full border border-green-500 px-6 py-3 text-sm font-semibold text-green-100 transition hover:bg-white/10">
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
