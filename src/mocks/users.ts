import { prisma } from "../database/prisma.database";
import { Bcrypt } from "../utils/bcrypt";

async function main() {
  const bcrypt = new Bcrypt();

  const users = [
    {
      name: "João Silva",
      email: "joao.silva@email.com",
      username: "joaosilva",
      password: "senha123",
    },
  ];

  // Gerar hash para as senhas
  for (let user of users) {
    user.password = await bcrypt.generateHash(user.password);
  }

  // Inserir usuários no banco
  await prisma.user.createMany({ data: users });
  console.log("Usuários inseridos com sucesso.");

  // Buscar os usuários inseridos para mapear os IDs
  const usersFromDb = await prisma.user.findMany();
  const userMap = usersFromDb.reduce((acc, user) => {
    acc[user.name] = user.id;
    return acc;
  }, {} as Record<string, string>);

  // Criando follows com base no mapeamento de usuários
  const follows = [
    { followerId: userMap["João Silva"], followedId: userMap["Ana Souza"] },
  ];

  // Inserir os follows no banco
  await prisma.follower.createMany({ data: follows });
  console.log("Follows inseridos com sucesso.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

// Comando para inserção: npx ts-node src/mock/users.ts
