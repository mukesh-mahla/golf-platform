-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "charityPercentage" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
ADD COLUMN     "selectedCharityId" TEXT;

-- CreateTable
CREATE TABLE "Charity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrizePool" (
    "id" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "match5Amount" DOUBLE PRECISION NOT NULL,
    "match4Amount" DOUBLE PRECISION NOT NULL,
    "match3Amount" DOUBLE PRECISION NOT NULL,
    "rolloverAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "PrizePool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winning" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "matchTier" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "proofUrl" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Winning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrizePool_drawId_key" ON "PrizePool"("drawId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_selectedCharityId_fkey" FOREIGN KEY ("selectedCharityId") REFERENCES "Charity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizePool" ADD CONSTRAINT "PrizePool_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winning" ADD CONSTRAINT "Winning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winning" ADD CONSTRAINT "Winning_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
