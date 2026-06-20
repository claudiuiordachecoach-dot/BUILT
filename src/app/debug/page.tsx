import { getSupabaseAuth, getUserRole } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  const role = await getUserRole();

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Debug Session</h1>
      <pre className="bg-black p-4 rounded text-xs overflow-auto">
        {JSON.stringify({
          email: user?.email || "NOT LOGGED IN",
          userId: user?.id || null,
          role: role,
        }, null, 2)}
      </pre>
      <div className="mt-8 space-y-4">
        <a href="/api/force-logout" className="block w-full text-center bg-red-600 p-4 rounded font-bold">
          [1] FORCE LOGOUT (Șterge tot)
        </a>
        <a href="/client/dashboard" className="block w-full text-center bg-blue-600 p-4 rounded font-bold">
          [2] Mergi la Client Dashboard
        </a>
      </div>
    </div>
  );
}
