-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "number" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);
