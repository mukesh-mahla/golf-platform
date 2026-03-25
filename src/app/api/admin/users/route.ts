import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = await getUserFromToken();
  if(!userId){
    return NextResponse.json({message:"Unauthorized"},{status:401})
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    include: { scores: true },
    
  });
  return NextResponse.json(users);
}