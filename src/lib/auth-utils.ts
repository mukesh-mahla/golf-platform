
import { redirect } from "next/navigation";
import { getUserFromToken } from "./middleware";
import prisma from "./db";


export const requireAuth = async ()=>{
   const userId = await getUserFromToken()

    if(!userId){
        redirect("/signin")
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

export async function requireAdmin() {
  const userId = await getUserFromToken();
  if (!userId) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  return user;
}