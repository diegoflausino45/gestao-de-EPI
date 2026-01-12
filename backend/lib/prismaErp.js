import "dotenv/config";
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '../generated/prisma/client.ts';

// Configuração para banco ERP/NEXT
const erpConfig = {
  user: process.env.NEXTSI_USER || "sa",
  password: process.env.NEXTSI_PASSWORD || "Admin@next",
  database: process.env.NEXTSI_DATABASE || "NEXTSI_HOMOLOG", // Ajuste o nome do banco ERP
  server: process.env.NEXTSI_HOST || "APLIC-SERVER",
  port: parseInt(process.env.NEXTSI_PORT || "1433"),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

const adapterErp = new PrismaMssql(erpConfig)
const prismaErp = new PrismaClient({ adapter: adapterErp });

export { prismaErp }
