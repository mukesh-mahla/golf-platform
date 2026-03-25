-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SIMULATION', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Draw" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'SIMULATION';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';
