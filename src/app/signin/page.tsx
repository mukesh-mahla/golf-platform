import SigninPage from "@/components/auth/signin"
import { requireUnAuth } from "@/lib/auth-utils"

const  Page =async ()=>{
        await requireUnAuth()
        return <SigninPage/>
}

export default Page