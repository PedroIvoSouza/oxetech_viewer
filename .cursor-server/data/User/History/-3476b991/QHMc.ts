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

async function fetchEduData(): Promise<EduData> {
  const response = await fetch('/api/edu')
  if (!response.ok) {
    throw new Error('Failed to fetch edu data')
  }
  return response.json()
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

