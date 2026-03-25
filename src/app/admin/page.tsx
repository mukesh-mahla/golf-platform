import { AdminDashboard } from "@/components/admin/dashboard";
import { requireAdmin } from "@/lib/auth-utils";
import { getQueryClient } from "@/lib/queryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import axios from "axios";
import { cookies } from "next/headers";

const AdminPage = async () => {
  await requireAdmin();
 const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin", "users"],
      queryFn: async () => {
        const res = await axios.get(`${process.env.BACKEND_URL}/api/admin/users`, {
          headers: { Cookie: cookieHeader },
        });
        return res.data;
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin", "draws"],
      queryFn: async () => {
        const res = await axios.get(`${process.env.BACKEND_URL}/api/admin/draw`, {
          headers: { Cookie: cookieHeader },
        });
        return res.data;
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p className="text-white/40 p-10">Loading...</p>}>
        <AdminDashboard />
      </Suspense>
    </HydrationBoundary>
  );
};

export default AdminPage;