-- CreateEnum
CREATE TYPE "Verified" AS ENUM ('NONE', 'BLUE', 'GOLD');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verified" "Verified" NOT NULL DEFAULT 'NONE';
