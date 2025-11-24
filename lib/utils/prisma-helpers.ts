/**
 * Helpers para uso seguro do Prisma
 */

import { prisma } from '@/lib/db'

/**
 * Verifica se o Prisma está disponível
 */
export function isPrismaAvailable(): boolean {
  return !!process.env.DATABASE_URL
}

/**
 * Executa uma query do Prisma com tratamento de erro
 */
export async function safePrismaQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isPrismaAvailable()) {
    console.warn('Prisma não disponível - DATABASE_URL não configurada')
    return fallback
  }

  try {
    return await queryFn()
  } catch (error) {
    console.error('Prisma query error:', error)
    return fallback
  }
}

/**
 * Executa múltiplas queries do Prisma em paralelo com tratamento de erro
 */
export async function safePrismaAll<T extends any[]>(
  queries: Array<() => Promise<any>>,
  fallbacks: T
): Promise<T> {
  if (!isPrismaAvailable()) {
    return fallbacks
  }

  try {
    const results = await Promise.all(queries.map(q => q()))
    return results as T
  } catch (error) {
    console.error('Prisma Promise.all error:', error)
    return fallbacks
  }
}

