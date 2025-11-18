/**
 * React Query hooks para Análise Detalhada do Lab
 */

import { useQuery } from '@tanstack/react-query'
import type { AnaliseDetalhadaLab } from '@/lib/bi/lab-analysis'

// ============================================
// ANÁLISE DETALHADA LAB
// ============================================

interface LabDetalhadoResponse {
  data: AnaliseDetalhadaLab
  error: string | null
}

async function fetchLabDetalhado(): Promise<AnaliseDetalhadaLab> {
  const response = await fetch('/api/bi/lab-detalhado', {
    credentials: 'include',
  })
  const json: LabDetalhadoResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar análise detalhada do Lab')
  }
  return json.data
}

export function useLabDetalhado() {
  return useQuery<AnaliseDetalhadaLab, Error>({
    queryKey: ['bi', 'lab-detalhado'],
    queryFn: fetchLabDetalhado,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchInterval: 15 * 60 * 1000, // Refetch a cada 15 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

