import { useQuery } from '@tanstack/react-query'

interface EduData {
  frequenciaPorEscola: Array<{
    escola: string
    frequencia: number
    totalPresencas: number
    totalAulas: number
  }>
  matriculasPorCurso: Array<{
    curso: string
    escola: string
    totalMatriculas: number
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
    refetchInterval: 60000,
  })
}

