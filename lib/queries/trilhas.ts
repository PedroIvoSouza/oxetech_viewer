import { useQuery } from '@tanstack/react-query'

interface TrilhaData {
  data: {
    stats: {
      totalTrilhas: number
      totalInscritos: number
      totalConcluidos: number
      progressoMedioGeral: number
      conclusaoMediaModulo: number
    }
    trilhas: Array<{
      id: number
      titulo: string
      descricao: string
      carga_horaria: number
      created_at: Date
      updated_at: Date
      modulos_trilhas: Array<{
        id: number
        curso_id: number
        cursos: {
          id: number
          titulo: string
          descricao: string
        }
        modulos_trilhas_pdfs: Array<{
          id: number
          nome: string
        }>
      }>
    }>
    progressoPorTrilha: Array<{
      id: number
      trilha: string
      totalInscritos: number
      concluidos: number
      progressoMedio: number
      percentualConclusao: number
      totalModulos: number
      status: 'ativo' | 'inativo'
    }>
    topTrilhas: Array<{
      id: number
      trilha: string
      totalInscritos: number
      concluidos: number
      progressoMedio: number
      percentualConclusao: number
      totalModulos: number
      status: 'ativo' | 'inativo'
    }>
    evolucaoTemporal: Array<{
      mes: string
      inscricoes: number
    }>
    inscritos: Array<{
      id: number
      aluno: string
      email: string
      trilha: string
      concluido: boolean
      percentualConcluido: number
      dataInscricao: Date
    }>
  }
  error: string | null
}

import { safeFetch } from '@/lib/utils/api-helpers'

async function fetchTrilhasData(
  periodo: string = 'all',
  busca: string = ''
): Promise<TrilhaData> {
  try {
    const params = new URLSearchParams()
    if (periodo) params.append('periodo', periodo)
    if (busca) params.append('busca', busca)

    const url = `/api/trilhas${params.toString() ? `?${params.toString()}` : ''}`
    const data = await safeFetch<TrilhaData>(url)
    if (!data.data) {
      return {
        data: {
          stats: {
            totalTrilhas: 0,
            totalInscritos: 0,
            totalConcluidos: 0,
            progressoMedioGeral: 0,
            conclusaoMediaModulo: 0,
          },
          trilhas: [],
          progressoPorTrilha: [],
          topTrilhas: [],
          evolucaoTemporal: [],
          inscritos: [],
        },
        error: 'Dados não disponíveis',
      }
    }
    return data
  } catch (error) {
    console.error('Error fetching trilhas data:', error)
    throw error
  }
}

export function useTrilhasData(periodo: string = 'all', busca: string = '') {
  return useQuery<TrilhaData, Error>({
    queryKey: ['trilhas', periodo, busca],
    queryFn: () => fetchTrilhasData(periodo, busca),
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
