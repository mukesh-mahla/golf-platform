import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/draw — create a new draw
function isNewMonth(oldDate: Date, newDate: Date) {
  return (
    oldDate.getMonth() !== newDate.getMonth() ||
    oldDate.getFullYear() !== newDate.getFullYear()
  );
}
export async function POST(req: NextRequest) {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { publish } = await req.json();
  const existingDraw = await prisma.draw.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  if (!existingDraw || isNewMonth(existingDraw.createdAt, now)) {
    const pool = Array.from({ length: 45 }, (_, i) => i + 1);
    const number = pool.sort(() => Math.random() - 0.5).slice(0, 5);

    const draw = await prisma.draw.create({
      data: {
        number,
        status: publish ? "PUBLISHED" : "SIMULATION",
      },
    });

    return NextResponse.json(draw, { status: 201 });
  }

  return NextResponse.json(
    { message: "Draw already exists for this month" },
    { status: 200 },
  );
}

// PATCH /api/admin/draw — publish a simulation
export async function PATCH(req: NextRequest) {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { drawId } = await req.json();

  const draw = await prisma.draw.update({
    where: { id: drawId },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json(draw);
}

export async function GET(req: NextRequest) {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const draws = await prisma.draw.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(draws);
}
