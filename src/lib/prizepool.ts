import prisma from "@/lib/db";

export async function calculateAndCreatePrizePool(drawId: string) {
  // 1. Mock the Revenue (Since we are bypassing Stripe)
  // Let's pretend every user pays $20/month, and 50% of revenue goes to the prize pool.
  const activeUsersCount = await prisma.user.count(); 
  const mockMonthlyFee = 20;
  const prizePoolCut = 0.50; 
  
  const totalAmount = (activeUsersCount * mockMonthlyFee) * prizePoolCut;

  // 2. Apply the PRD's Strict Tiers
  const match5Amount = totalAmount * 0.40; // 40% for 5-number match
  const match4Amount = totalAmount * 0.35; // 35% for 4-number match
  const match3Amount = totalAmount * 0.25; // 25% for 3-number match

  // 3. Find any rollover jackpot from the PREVIOUS draw
  const previousDraw = await prisma.draw.findFirst({
    where: { 
      id: { not: drawId }, 
      status: "PUBLISHED" 
    },
    orderBy: { createdAt: "desc" },
    include: { prizePool: true }
  });

  const rolloverAmount = previousDraw?.prizePool?.rolloverAmount || 0;

  // 4. Create the Prize Pool record for THIS draw
  const newPool = await prisma.prizePool.create({
    data: {
      drawId,
      totalAmount,
      // Add the rollover jackpot to the 5-match tier
      match5Amount: match5Amount + rolloverAmount, 
      match4Amount,
      match3Amount,
      rolloverAmount: 0 // This stays 0 until we check if someone won the 5-match
    }
  });

  return newPool;
}