import { prisma } from "../database/prisma.database";

async function main() {
  // Usuários cadastrados
  const users = await prisma.user.findMany();
  const userMap = users.reduce((acc, user) => {
    acc[user.name] = user.id;
    return acc;
  }, {} as Record<string, string>);

  // Criando tweets
  const tweets = await prisma.tweet.createMany({
    data: [
      {
        userId: userMap["Luciana Rocha"],
        tweetType: "TWEET",
        content: "Fazendo testes automatizados pela primeira vez!",
      },
    ],
    skipDuplicates: true,
  });

  const createdTweets = await prisma.tweet.findMany();
  const tweetMap = createdTweets.reduce((acc, tweet) => {
    acc[tweet.content] = tweet.id;
    return acc;
  }, {} as Record<string, string>);

  // Criando replies
  await prisma.tweet.createMany({
    data: [
      {
        userId: userMap["João Silva"],
        tweetType: "REPLY",
        parentId: tweetMap["Back-end ou front-end? Eis a questão."],
        content: "Fiquei curioso, qual a melhor abordagem?",
      },
    ],
    skipDuplicates: true,
  });

  // Criando likes
  await prisma.like.createMany({
    data: [
      {
        userId: userMap["João Silva"],
        tweetId: tweetMap["Fiquei curioso, qual a melhor abordagem?"],
      },
    ],
    skipDuplicates: true,
  });

  console.log("Tweets, replies, retweets e likes criados com sucesso.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

// Comando para inserção: npx ts-node src/mock/tweets.ts
