import { Dashboard } from "@/components/dashboard/dashboard";
import { requireAuth } from "@/lib/auth-utils"
import { getQueryClient } from "@/lib/queryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import axios from "axios"
const Page = async () => {

    await requireAuth()
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["score"],
        queryFn: async () => {
            const res = await axios.get(`${process.env.BACKEND_URL}/api/score`, { withCredentials: true })
            return res.data
        }
    })

    return <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>loading...</p>}>
            <Dashboard />
        </Suspense>
    </HydrationBoundary>
}

export default Page