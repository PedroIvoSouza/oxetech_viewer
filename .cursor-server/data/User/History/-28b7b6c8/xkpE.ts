import { useQuery } from '@tanstack/react-query'

interface LabData {
  stats: {
    totalInscricoes: number
    inscricoesPorStatus: Array<{
      status: string
      total: number
    }>
  }
  distribuicaoPorCurso: Array<{
    curso: string
    total: number
  }>
  evolucaoTemporal: Array<{
    mes: string
    inscricoes: number
  }>
  inscricoesPorLaboratorio: Array<{
    laboratorio: string
    total: number
  }>
}

async function fetchLabData(): Promise<LabData> {
  const response = await fetch('/api/lab')
  if (!response.ok) {
    throw new Error('Failed to fetch lab data')
  }
  return response.json()
}

export function useLabData() {
  return useQuery<LabData, Error>({
    queryKey: ['lab'],
    queryFn: fetchLabData,
    refetchInterval: 60000,
  })
}

