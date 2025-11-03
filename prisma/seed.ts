import { Bcrypt } from "../src/utils/bcrypt";
import { prisma } from "../src/database/prisma.database";

// Função para buscar usuários da API Random User
async function fetchRandomUsers(count: number = 20) {
  try {
    const response = await fetch(
      `https://randomuser.me/api/?results=${count}&nat=br,us,gb`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("❌ Erro ao buscar usuários:", error);
    return [];
  }
}

// Função para buscar posts da API JSON Placeholder
async function fetchRandomPosts(count: number = 50) {
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts?_limit=${count}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar posts:", error);
    return [];
  }
}

// Função para gerar hashtags baseadas no conteúdo
function generateHashtags(): string {
  const topics = [
    "Tech",
    "IA",
    "Inovação",
    "Tecnologia",
    "Dev",
    "Coding",
    "Web",
    "Mobile",
    "Cloud",
    "AI",
    "Frontend",
    "Backend",
    "Design",
    "UX",
    "React",
    "Node",
    "Python",
    "JavaScript",
    "TypeScript",
    "Data",
  ];

  const hashtags: string[] = [];
  const numHashtags = Math.floor(Math.random() * 2) + 2; // 2-3 hashtags

  for (let i = 0; i < numHashtags; i++) {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    if (!hashtags.includes(randomTopic)) {
      hashtags.push(randomTopic);
    }
  }

  return hashtags.map((tag) => `#${tag}`).join(" ");
}

// Função para escolher usuário aleatório
function randomUser(users: any[]) {
  return users[Math.floor(Math.random() * users.length)];
}

async function seedUsers() {
  const bcrypt = new Bcrypt();

  console.log("🔄 Buscando usuários da API Random User...");
  const randomUsers = await fetchRandomUsers(25);

  if (randomUsers.length === 0) {
    console.log("❌ Nenhum usuário foi encontrado da API. Abortando seed.");
    return [];
  }

  // Deletar dados antigos
  console.log("🗑️  Limpando banco de dados...");
  await prisma.user.deleteMany();

  const users = randomUsers.map((user: any, index: number) => ({
    name: `${user.name.first} ${user.name.last}`,
    email: user.email,
    username: user.login.username.toLowerCase(),
    password: "senha123", // Será hasheado abaixo
    avatarUrl: user.picture.large,
    coverUrl: `https://picsum.photos/seed/cover${index}/1500/500`, // Foto de capa
    bio: `📍 ${user.location.city}, ${user.location.country} | 💻 ${
      ["Developer", "Designer", "Engineer", "Product Manager", "Tech Lead"][
        Math.floor(Math.random() * 5)
      ]
    } | ⚡ Tech enthusiast`,
  }));

  // Gerar hash para as senhas
  console.log("🔐 Gerando hash das senhas...");
  for (let user of users) {
    user.password = await bcrypt.generateHash(user.password);
  }

  console.log(`✅ Criando ${users.length} usuários...`);
  // Inserir usuários no banco
  await prisma.user.createMany({ data: users });

  // Buscar os usuários inseridos
  const usersFromDb = await prisma.user.findMany();

  // Criar seguidores aleatórios (cada usuário segue 4-10 pessoas aleatórias)
  console.log("🔄 Criando relacionamentos de seguir...");
  const follows: { followerId: string; followedId: string }[] = [];

  for (const follower of usersFromDb) {
    const numFollows = Math.floor(Math.random() * 7) + 4; // 4-10 follows
    const otherUsers = usersFromDb.filter((u) => u.id !== follower.id);

    // Seleciona usuários aleatórios para seguir
    const shuffled = otherUsers.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numFollows);

    for (const followed of selected) {
      follows.push({
        followerId: follower.id,
        followedId: followed.id,
      });
    }
  }

  await prisma.follower.createMany({ data: follows, skipDuplicates: true });
  console.log(`✅ Criados ${follows.length} relacionamentos de seguir`);

  return usersFromDb;
}

async function seedTweets(users: any[]) {
  if (users.length === 0) {
    console.log("❌ Nenhum usuário disponível para criar tweets.");
    return;
  }

  console.log("🔄 Buscando posts da API JSON Placeholder...");
  const randomPosts = await fetchRandomPosts(80);

  if (randomPosts.length === 0) {
    console.log("❌ Nenhum post foi encontrado da API.");
    return;
  }

  // 1. GARANTIR QUE CADA USUÁRIO TENHA PELO MENOS 1 POST DE TEXTO
  console.log("📝 Criando 1 post de texto para cada usuário...");
  const textTweets = users.map((user, index) => {
    let content = randomPosts[index % randomPosts.length].body
      .replace(/\n/g, " ")
      .substring(0, 200)
      .trim();
    content += " " + generateHashtags();

    return {
      userId: user.id,
      tweetType: "TWEET",
      content,
      imageUrl: null, // Apenas texto
    };
  });
  await prisma.tweet.createMany({ data: textTweets as any });

  // 2. GARANTIR QUE CADA USUÁRIO TENHA PELO MENOS 1 POST DE MÍDIA
  console.log("🖼️  Criando 1 post de mídia para cada usuário...");
  const mediaTweets = users.map((user, index) => {
    let content = randomPosts[(index + 10) % randomPosts.length].body
      .replace(/\n/g, " ")
      .substring(0, 150)
      .trim();
    content += " " + generateHashtags();

    return {
      userId: user.id,
      tweetType: "TWEET",
      content,
      imageUrl: `https://picsum.photos/seed/media${index}/800/600`,
    };
  });
  await prisma.tweet.createMany({ data: mediaTweets as any });

  // Buscar tweets criados até agora
  let createdTweets = await prisma.tweet.findMany();
  console.log(`✅ ${createdTweets.length} tweets criados!`);

  // 3. GARANTIR QUE CADA USUÁRIO TENHA PELO MENOS 1 REPLY
  console.log("� Criando 1 reply para cada usuário...");
  const replyTexts = [
    "Concordo totalmente! 👍",
    "Interessante ponto de vista!",
    "Nunca tinha pensado por esse ângulo 🤔",
    "Excelente reflexão!",
    "Isso faz muito sentido!",
    "Obrigado por compartilhar! 🙏",
    "Muito bom! Vou testar isso.",
    "Achei incrível! ✨",
    "Perfeito! 💯",
    "Adorei essa ideia! 💡",
  ];

  const guaranteedReplies = users.map((user, index) => {
    // Pega um tweet de outro usuário para responder
    const otherUsersTweets = createdTweets.filter((t) => t.userId !== user.id);
    const parentTweet = otherUsersTweets[index % otherUsersTweets.length];

    return {
      userId: user.id,
      parentId: parentTweet.id,
      tweetType: "REPLY",
      content: replyTexts[index % replyTexts.length],
    };
  });

  await prisma.tweet.createMany({ data: guaranteedReplies as any });
  console.log(`✅ ${guaranteedReplies.length} respostas garantidas criadas!`);

  // Criar replies extras aleatórios
  const extraReplies = [];
  const numExtraReplies = 30;

  for (let i = 0; i < numExtraReplies; i++) {
    const parentTweet = randomUser(createdTweets);
    const user = randomUser(users);

    extraReplies.push({
      userId: user.id,
      parentId: parentTweet.id,
      tweetType: "REPLY",
      content: replyTexts[Math.floor(Math.random() * replyTexts.length)],
    });
  }

  await prisma.tweet.createMany({ data: extraReplies as any });
  console.log(`✅ ${extraReplies.length} respostas extras criadas!`);

  // 4. GARANTIR QUE CADA USUÁRIO DÊ PELO MENOS 1 LIKE
  console.log("❤️  Criando 1 curtida para cada usuário...");
  // Atualizar lista de tweets após replies
  createdTweets = await prisma.tweet.findMany();

  const guaranteedLikes = users.map((user, index) => {
    // Pega um tweet de outro usuário para curtir
    const otherUsersTweets = createdTweets.filter((t) => t.userId !== user.id);
    const tweetToLike = otherUsersTweets[index % otherUsersTweets.length];

    return {
      userId: user.id,
      tweetId: tweetToLike.id,
    };
  });

  await prisma.like.createMany({ data: guaranteedLikes, skipDuplicates: true });
  console.log(`✅ ${guaranteedLikes.length} curtidas garantidas criadas!`);

  // Criar likes extras aleatórios
  const extraLikes = [];
  const numExtraLikes = 150;

  for (let i = 0; i < numExtraLikes; i++) {
    const tweet = randomUser(createdTweets);
    const user = randomUser(users);

    // Impedir que o usuário curta o próprio tweet
    if (user.id !== tweet.userId) {
      extraLikes.push({
        userId: user.id,
        tweetId: tweet.id,
      });
    }
  }

  await prisma.like.createMany({ data: extraLikes, skipDuplicates: true });
  console.log(`✅ Curtidas extras criadas!`);

  // 5. GARANTIR QUE CADA USUÁRIO FAÇA PELO MENOS 1 RETWEET
  console.log("� Criando 1 retweet para cada usuário...");
  const retweetComments = [
    "Isso é ouro! 🏆",
    "Compartilhando essa pérola!",
    "Todo mundo precisa ver isso!",
    "Impressionante! 🔥",
    "Salvando para referência futura.",
    null, // Sem comentário
  ];

  const guaranteedRetweets = users.map((user, index) => {
    // Pega um tweet de outro usuário para retweet
    const otherUsersTweets = createdTweets.filter((t) => t.userId !== user.id);
    const tweetToRetweet = otherUsersTweets[index % otherUsersTweets.length];

    return {
      userId: user.id,
      tweetId: tweetToRetweet.id,
      comment:
        index % 3 === 0
          ? retweetComments[index % retweetComments.length]
          : null, // 1/3 com comentário
    };
  });

  await prisma.retweet.createMany({
    data: guaranteedRetweets,
    skipDuplicates: true,
  });
  console.log(`✅ ${guaranteedRetweets.length} retweets garantidos criados!`);

  // Criar retweets extras aleatórios
  const extraRetweets = [];
  const numExtraRetweets = 40;

  for (let i = 0; i < numExtraRetweets; i++) {
    const tweet = randomUser(createdTweets);
    const user = randomUser(users);

    const hasComment = Math.random() > 0.6; // 40% com comentário

    // Impedir que o usuário retweet o próprio tweet
    if (user.id !== tweet.userId) {
      extraRetweets.push({
        userId: user.id,
        tweetId: tweet.id,
        comment: hasComment
          ? retweetComments[Math.floor(Math.random() * retweetComments.length)]
          : null,
      });
    }
  }

  await prisma.retweet.createMany({
    data: extraRetweets,
    skipDuplicates: true,
  });
  console.log(`✅ Retweets extras criados!`);
}

async function main() {
  console.log("🚀 Iniciando seed...\n");

  const users = await seedUsers();
  await seedTweets(users);

  console.log("\n🎉 Seed concluída com sucesso!");
  console.log(`👤 Total de usuários: ${users.length}`);
  console.log(`📝 Use as credenciais: qualquer email / senha: senha123`);
}

main()
  .catch((e) => {
    console.error("❌ Erro durante a seed:", e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
