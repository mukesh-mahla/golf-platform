import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { selectedCharityId: true, charityPercentage: true },
  });

const drawsEntered = await prisma.winning.count({ where: { userId } });
 return NextResponse.json({
    selectedCharityId: user?.selectedCharityId ?? null,
    charityPercentage: user?.charityPercentage ?? 10,
    drawsEntered,
  });
}

