
import { redirect } from "next/navigation";
import { getUserFromToken } from "./middleware";


export const requireAuth = async ()=>{
   const userId = await getUserFromToken()

    if(!userId){
        redirect("/login")
    }
    return userId
}

export const requireUnAuth = async ()=>{
   const userId = await getUserFromToken()

    if(userId){
        redirect("/dashboard")
    }
    return userId
}