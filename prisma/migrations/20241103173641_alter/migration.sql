/*
  Warnings:

  - You are about to drop the column `updated_at` on the `followers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `likes` table. All the data in the column will be lost.
  - Added the required column `followed_id` to the `followers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "followers" DROP COLUMN "updated_at",
ADD COLUMN     "followed_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "updated_at";

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
