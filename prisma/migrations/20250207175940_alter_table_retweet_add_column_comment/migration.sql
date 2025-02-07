/*
  Warnings:

  - The values [RETWEET] on the enum `TweetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TweetType_new" AS ENUM ('TWEET', 'REPLY');
ALTER TABLE "tweets" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "tweets" ALTER COLUMN "type" TYPE "TweetType_new" USING ("type"::text::"TweetType_new");
ALTER TYPE "TweetType" RENAME TO "TweetType_old";
ALTER TYPE "TweetType_new" RENAME TO "TweetType";
DROP TYPE "TweetType_old";
ALTER TABLE "tweets" ALTER COLUMN "type" SET DEFAULT 'TWEET';
COMMIT;

-- AlterTable
ALTER TABLE "retweets" ADD COLUMN     "comment" TEXT;
