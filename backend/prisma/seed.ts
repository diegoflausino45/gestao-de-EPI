import { prisma } from "../src/db/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Lista de usuários iniciais
  const users = [
    {
      nome: "Arthur",
      email: "arthur@ultradisplays.com.br",
      password: "arthur", // Será hashada
      role: "admin",
    },
    {
      nome: "Lucas Rodrigues",
      email: "lucas.rodrigues@ultradisplays.com.br",
      password: "lucas",
      role: "admin",
    },
    {
      nome: "Diego Flausino",
      email: "diego.flausino@ultradisplays.com.br",
      password: "diego",
      role: "admin",
    },
    {
      nome: "Admin Teste",
      email: "admin@teste.com",
      password: "admin",
      role: "admin",
    },
  ];

  for (const user of users) {
    // Verifica se já existe
    const exists = await prisma.usuario.findUnique({
      where: { email: user.email },
    });

    if (!exists) {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await prisma.usuario.create({
        data: {
          nome: user.nome,
          email: user.email,
          senha: hashedPassword,
          role: user.role,
        },
      });
      console.log(`✅ Usuário criado: ${user.nome} (${user.email})`);
    } else {
      console.log(`⚠️ Usuário já existe: ${user.nome}`);
    }
  }

  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
