// src/db/prisma-erp.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const sqlHost = process.env.SQL_HOST;
const sqlUser = process.env.SQL_USER;
const sqlPassword = process.env.SQL_PASSWORD;
const sqlDb = process.env.SQL_DB;
const sqlPort = Number(process.env.SQL_PORT ?? 1433);

if (!sqlHost || !sqlUser || !sqlPassword || !sqlDb) {
  throw new Error("Missing required database environment variables (SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB)");
}

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
export const prismaErp = new PrismaClient({ adapter });
