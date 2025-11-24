import { useQuery } from '@tanstack/react-query'

interface WorkData {
  data: {
    stats: {
      vagas: number
      empresas: number
      candidaturas: number
      contratacoes: number
      inscricoes?: number
    }
    funilPorEdital: Array<{
      edital: string
      inscricoes: number
      candidaturas: number
      contratacoes: number
      totalVagas?: number
      vagasOferta?: number
      vagasPreenchidas?: number
    }>
    empresas: Array<{
      id: number
      razao_social: string
      email: string
      totalVagas: number
      totalCandidaturas: number
      totalInscricoes: number
      totalContratacoes: number
      taxaConversao: string
    }>
    vagasPorStatus: Array<{
      status: string
      total: number
    }>
    vagas: Array<{
      id: number
      titulo: string
      status: string
      quantidade: number
      empresa: string
      totalCandidaturas: number
      dataEncerramento: Date | null
    }>
    temposMedios: {
      inscricaoCandidatura: number
      candidaturaContratacao: number
    }
  }
  error: string | null
}

import { safeFetch } from '@/lib/utils/api-helpers'

async function fetchWorkData(): Promise<WorkData> {
  try {
    const data = await safeFetch<WorkData>('/api/work')
    // Garantir estrutura válida
    if (!data.data) {
      return {
        data: {
          stats: {
            vagas: 0,
            empresas: 0,
            candidaturas: 0,
            contratacoes: 0,
            inscricoes: 0,
          },
          funilPorEdital: [],
          empresas: [],
          vagasPorStatus: [],
          vagas: [],
          temposMedios: {
            inscricaoCandidatura: 0,
            candidaturaContratacao: 0,
          },
        },
        error: 'Dados não disponíveis',
      }
    }
    return data
  } catch (error) {
    console.error('Error fetching work data:', error)
    throw error
  }
}

export function useWorkData() {
  return useQuery<WorkData, Error>({
    queryKey: ['work'],
    queryFn: fetchWorkData,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

