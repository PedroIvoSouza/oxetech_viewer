import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar pool de conexões maior para evitar timeouts
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Aumentar o pool de conexões via variável de ambiente ou URL
// O Prisma usa connection_limit via DATABASE_URL ou configuração do cliente
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

