/*
  Warnings:

  - You are about to drop the column `user_id` on the `followers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "followers" DROP CONSTRAINT "followers_user_id_fkey";

-- AlterTable
ALTER TABLE "followers" DROP COLUMN "user_id";

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
