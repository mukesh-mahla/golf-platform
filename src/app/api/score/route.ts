import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { value, date } = body;

  // Validation
  if (!value || !date) {
    return NextResponse.json(
      { message: "Score and date are required" },
      { status: 400 }
    );
  }

  if (value < 1 || value > 45) {
    return NextResponse.json(
      { message: "Score must be between 1–45" },
      { status: 400 }
    );
  }

  // Count existing scores
  const count = await prisma.score.count({
    where: { userId },
  });

  // If already 5 → delete OLDEST
  if (count >= 5) {
    const oldest = await prisma.score.findFirst({
      where: { userId },
      orderBy: [
        { date: "asc" },        
        { createdAt: "asc" }   
      ],
    });

    if (oldest) {
      await prisma.score.delete({
        where: { id: oldest.id },
      });
    }
  }

  // Create new score
  await prisma.score.create({
    data: {
      userId,
      value,
      date: new Date(date),
    },
  });

  return NextResponse.json(
    { message: "Score added successfully" },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const userId = await getUserFromToken();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: [
      { date: "desc" },        
      { createdAt: "desc" }  
    ],
  });

  return NextResponse.json(scores);
}