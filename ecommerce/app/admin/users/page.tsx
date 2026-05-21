import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateUserRole } from "../updateUserRoleAction";
import FlashMessage from "@/app/components/FlashMessage";

type ProfileRow = {
  id: string;
  full_name: string;
  role: string;
  shop_name: string | null;
  created_at: string;
};

async function getProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,role,shop_name,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as ProfileRow[];
}

export default async function AdminUsersPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
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

  const profiles = await getProfiles();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">User Management</h1>
            <p className="text-gray-400">Review customers and merchants, and promote users to merchants or admins.</p>
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
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Shop</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-green-700/20 hover:bg-white/5">
                    <td className="px-4 py-4 text-xs text-green-200">{profile.id.slice(0, 8)}</td>
                    <td className="px-4 py-4">{profile.full_name || "Anonymous"}</td>
                    <td className="px-4 py-4">{profile.role}</td>
                    <td className="px-4 py-4">{profile.shop_name || "—"}</td>
                    <td className="px-4 py-4">
                      <form action={updateUserRole} className="flex flex-wrap gap-2">
                        <input type="hidden" name="userId" value={profile.id} />
                        <button name="role" value="customer" className="rounded-full border border-green-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                          Customer
                        </button>
                        <button name="role" value="merchant" className="rounded-full border border-green-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                          Merchant
                        </button>
                        <button name="role" value="admin" className="rounded-full border border-green-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                          Admin
                        </button>
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
