// IMPORTS DE DEPENDÊNCIAS E CONFIGURAÇÕES
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

// Configurações de conexão com o banco de dados SQL Server via variáveis de ambiente
const sqlHost = process.env.SQL_HOST;
const sqlUser = process.env.SQL_USER;
const sqlPassword = process.env.SQL_PASSWORD;
const sqlDb = process.env.SQL_DB;
const sqlPort = Number(process.env.SQL_PORT ?? 1433);

// Validação básica das variáveis de ambiente necessárias
if (!sqlHost || !sqlUser || !sqlPassword || !sqlDb) {
  throw new Error("Missing required database environment variables (SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB)");
}

// Configuração de conexão com o SQL Server
const config = {
  server: sqlHost,
  port: sqlPort,
  database: sqlDb,
  user: sqlUser,
  password: sqlPassword,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Adapter para usar o driver mssql com Prisma
const adapter = new PrismaMssql(config);

// Prisma Client tipado
export const prisma = new PrismaClient({ adapter });
