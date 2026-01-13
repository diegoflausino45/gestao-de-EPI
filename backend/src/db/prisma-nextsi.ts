import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

// Tenta pegar configurações específicas do NEXTSI, senão cai para as globais do SQL
const server = process.env.NEXTSI_HOST ?? process.env.SQL_HOST;
const port = Number(process.env.NEXTSI_PORT ?? process.env.SQL_PORT ?? 1433);
const database = process.env.NEXTSI_DB ?? "NEXTSI_HOMOLOG"; // Database fixo por padrão
const user = process.env.NEXTSI_USER ?? process.env.SQL_USER;
const password = process.env.NEXTSI_PASSWORD ?? process.env.SQL_PASSWORD;

if (!server || !user || !password) {
  throw new Error("Missing database credentials for NEXTSI integration.");
}

const config = {
  server,
  port,
  database,
  user,
  password,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const adapter = new PrismaMssql(config);

console.log(`[Prisma NEXTSI] Conectando a ${server}:${port}/${database} com usuário ${user}`);

export const prismaNextsi = new PrismaClient({ adapter });
