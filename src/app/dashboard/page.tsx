import { Dashboard } from "@/components/user/dashboard";
import { requireAuth } from "@/lib/auth-utils"
import { getQueryClient } from "@/lib/queryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { cookies } from "next/headers";

import axios from "axios"
const Page = async () => {

    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()
    await requireAuth()
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["score"],
        queryFn: async () => {
            const res = await axios.get(`${process.env.BACKEND_URL}/api/score`, {
                headers: { Cookie: cookieHeader },
            })
            return res.data
        }
    })

    await queryClient.prefetchQuery({
        queryKey: ["draw"],
        queryFn: async () => {
            const res = await axios.get(`${process.env.BACKEND_URL}/api/draw`, {
                headers: { Cookie: cookieHeader }
            })
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