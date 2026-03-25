// app/api/user/subscription/route.ts
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, renewalDate: true },
  });

  if (!subscription) {
    return NextResponse.json({
      plan: null,
      status: "INACTIVE",
      renewalDate: null,
    });
  }

  return NextResponse.json(subscription);
}