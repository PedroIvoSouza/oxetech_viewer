/**
 * Cache LRU para queries Prisma
 * Evita consultas repetidas ao banco de dados
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private defaultTTL: number // milliseconds

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    // Default: 5 minutos
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Mover para o final (LRU)
    this.cache.delete(key)
    this.cache.set(key, entry)
    return entry.data
  }

  set(key: string, data: T, ttl?: number): void {
    // Se já existe, remover
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Se está cheio, remover o mais antigo (primeiro)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Invalidar cache por padrão (ex: prefixo de chave)
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

// Caches por tipo de dados
export const queryCache = new LRUCache<any>(200, 5 * 60 * 1000) // 5 min
export const kpiCache = new LRUCache<any>(50, 2 * 60 * 1000) // 2 min
export const statsCache = new LRUCache<any>(100, 3 * 60 * 1000) // 3 min

/**
 * Helper para criar chave de cache
 */
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join('|')
  return `${prefix}:${sortedParams}`
}

/**
 * Wrapper para queries Prisma com cache
 */
export async function cachedQuery<T>(
  cache: LRUCache<T>,
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Tentar obter do cache
  const cached = cache.get(key)
  if (cached !== null) {
    return cached
  }

  // Executar query
  const result = await queryFn()

  // Salvar no cache
  cache.set(key, result, ttl)

  return result
}

