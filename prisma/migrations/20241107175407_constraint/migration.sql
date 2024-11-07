/*
  Warnings:

  - A unique constraint covering the columns `[tweet_id,user_id]` on the table `likes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "likes_tweet_id_user_id_key" ON "likes"("tweet_id", "user_id");
