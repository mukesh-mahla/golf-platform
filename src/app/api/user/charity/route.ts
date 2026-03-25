import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all charities for the frontend dropdown
export async function GET() {
  const charities = await prisma.charity.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(charities);
}

// PATCH: Update the user's selected charity and percentage
export async function PATCH(req: NextRequest) {
  const userId = await getUserFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { charityId, percentage } = body;

  // PRD Rule: Minimum contribution is 10%
  if (percentage < 10) {
    return NextResponse.json(
      { message: "Minimum charity contribution is 10%" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      selectedCharityId: charityId,
      charityPercentage: percentage,
    },
  });

  return NextResponse.json({ message: "Charity preferences updated successfully" });
}