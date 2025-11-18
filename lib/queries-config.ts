/**
 * Configuração centralizada para React Query
 * Define staleTime e refetchInterval por tipo de dado
 */

export const queryConfig = {
  // KPIs e estatísticas (mudam pouco)
  kpis: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  },
  // Dados operacionais (mudam com frequência)
  operational: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000, // 3 minutos
  },
  // Dados em tempo real (mudam constantemente)
  realtime: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000,
    refetchInterval: 1 * 60 * 1000, // 1 minuto
  },
  // Dados estáticos (mudam raramente)
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchInterval: false,
  },
}

