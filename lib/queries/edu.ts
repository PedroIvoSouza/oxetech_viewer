import { useQuery } from '@tanstack/react-query'

interface EduData {
  data: {
    frequenciaPorEscola: Array<{
      escola: string
      municipio: string
      frequencia: number
      totalPresencas: number
      totalAulas: number
      totalMatriculas: number
    }>
    frequenciaDiaria: Array<{
      dia: string
      frequencia: number
      presencas: number
      total: number
    }>
    rankingCursos: Array<{
      curso: string
      escola: string
      totalMatriculas: number
    }>
    matriculasPorCurso: Array<{
      curso: string
      escola: string
      totalMatriculas: number
    }>
    mapaCalorHorario: Array<{
      horario: string
      frequencia: number
    }>
    comparativoMensal: Array<{
      mes: string
      matriculas: number
    }>
    stats: {
      totalEscolas: number
      totalMatriculas: number
      totalTurmas: number
    }
    matriculasPorStatus: Array<{
      status: string
      total: number
    }>
  }
  error: string | null
}

import { safeFetch } from '@/lib/utils/api-helpers'

async function fetchEduData(): Promise<EduData> {
  try {
    const data = await safeFetch<EduData>('/api/edu')
    if (!data.data) {
      return {
        data: {
          stats: {
            totalEscolas: 0,
            totalMatriculas: 0,
            totalTurmas: 0,
          },
          frequenciaPorEscola: [],
          frequenciaDiaria: [],
          rankingCursos: [],
          matriculasPorCurso: [],
          mapaCalorHorario: [],
          comparativoMensal: [],
          matriculasPorStatus: [],
        },
        error: 'Dados não disponíveis',
      }
    }
    return data
  } catch (error) {
    console.error('Error fetching edu data:', error)
    throw error
  }
}

export function useEduData() {
  return useQuery<EduData, Error>({
    queryKey: ['edu'],
    queryFn: fetchEduData,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

