/*
  Warnings:

  - A unique constraint covering the columns `[tweet_id,user_id]` on the table `retweets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "retweets_tweet_id_user_id_key" ON "retweets"("tweet_id", "user_id");
