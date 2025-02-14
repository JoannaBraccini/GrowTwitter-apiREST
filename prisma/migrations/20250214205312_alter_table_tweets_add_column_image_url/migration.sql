/*
  Warnings:

  - You are about to alter the column `content` on the `tweets` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(280)`.

*/
-- AlterTable
ALTER TABLE "tweets" ADD COLUMN     "image-url" TEXT,
ALTER COLUMN "content" SET DATA TYPE VARCHAR(280);
