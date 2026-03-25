import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const draw = await prisma.draw.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  if (!draw) {
    return NextResponse.json({ message: "No draw available yet"});
  }

  return NextResponse.json(draw);
}