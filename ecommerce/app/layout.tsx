import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "./signOutAction";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce Marketplace",
  description: "A simple role-based ecommerce marketplace built with Next.js and Supabase.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const userResp = await supabase.auth.getUser();
  const user = userResp.data?.user;
  const profileResp = user
    ? await supabase.from("profiles").select("role,shop_name").eq("id", user.id).maybeSingle()
    : { data: null };
  const profile = profileResp.data;
  const role = profile?.role;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="bg-green-900 text-white">
          <nav className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-10">
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold uppercase tracking-[0.2em]">
              <Link href="/" className="transition hover:text-green-200">Home</Link>
              <Link href="/products" className="transition hover:text-green-200">Shop</Link>
              <Link href="/cart" className="transition hover:text-green-200">Cart</Link>
              {user && <Link href="/orders" className="transition hover:text-green-200">Orders</Link>}
              {role !== "merchant" && role !== "admin" && (
                <Link href="/merchant/auth" className="transition hover:text-green-200">Sell</Link>
              )}
              {(role === "merchant" || role === "admin") && (
                <Link href="/merchant/dashboard" className="transition hover:text-green-200">Dashboard</Link>
              )}
              {role === "admin" && (
                <Link href="/admin" className="transition hover:text-green-200">Admin</Link>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm font-medium">
              {user ? (
                <>
                  <span className="hidden sm:inline-flex text-green-200">{profile?.shop_name ?? user.email ?? user.id.slice(0, 8)}</span>
                  <form action={signOutAction} className="inline">
                    <button type="submit" className="rounded-full border border-green-500 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="rounded-full border border-green-500 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                  Login
                </Link>
              )}
            </div>
          </nav>
        </header>

        <main className="flex-1 bg-[#08110f] text-white">
          {children}
        </main>

        <footer className="flex justify-center bg-green-700 py-4">
          <p>@Ecommerce sa BSMGT/ISTR21/ISOOPR</p>
        </footer>
      </body>
    </html>
  );
}
