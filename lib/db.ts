import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar pool de conexões maior para evitar timeouts
// Durante o build, não inicializar o Prisma se DATABASE_URL não estiver definida
export const prisma =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL
    ? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        // Configurações de pool de conexões
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      })
    : (new Proxy({} as PrismaClient, {
        get() {
          throw new Error('Prisma Client não foi inicializado. DATABASE_URL não está definida.')
        },
      })))

// Aumentar o pool de conexões via variável de ambiente ou URL
// O Prisma usa connection_limit via DATABASE_URL ou configuração do cliente
if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma as PrismaClient
}

