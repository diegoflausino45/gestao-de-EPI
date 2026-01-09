// src/db/prisma-nextsi.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

// Usar credenciais específicas para NEXTSI_HOMOLOG (pode ser diferentes)
const server = process.env.NEXTSI_HOST ?? process.env.SQL_HOST ?? "APLIC-SERVER";
const port = Number(process.env.NEXTSI_PORT ?? process.env.SQL_PORT ?? 1433);
const user = process.env.NEXTSI_USER ?? process.env.SQL_USER ?? "sa";
const password = process.env.NEXTSI_PASSWORD ?? process.env.SQL_PASSWORD ?? "";
const database = "NEXTSI_HOMOLOG";

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

console.log(`[Prisma NEXTSI] Conectando a ${server}:${port}/${database} com usuário ${user}`);

// Adapter para usar o driver mssql com Prisma
const adapter = new PrismaMssql(config);

// Prisma Client tipado para NEXTSI_HOMOLOG
export const prismaNextsi = new PrismaClient({ adapter });
