// app/api/user/winnings/route.ts
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const winnings = await prisma.winning.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      matchTier: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(winnings);
}