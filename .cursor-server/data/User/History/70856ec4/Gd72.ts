import { useQuery } from '@tanstack/react-query'

interface WorkData {
  stats: {
    vagas: number
    empresas: number
    candidaturas: number
    contratacoes: number
  }
  funilPorEdital: Array<{
    edital: string
    inscricoes: number
    candidaturas: number
    contratacoes: number
  }>
  empresas: Array<{
    id: number
    razao_social: string
    email: string
    totalVagas: number
    totalCandidaturas: number
    totalInscricoes: number
  }>
  vagasPorStatus: Array<{
    status: string
    total: number
  }>
}

async function fetchWorkData(): Promise<WorkData> {
  const response = await fetch('/api/work')
  if (!response.ok) {
    throw new Error('Failed to fetch work data')
  }
  return response.json()
}

export function useWorkData() {
  return useQuery<WorkData, Error>({
    queryKey: ['work'],
    queryFn: fetchWorkData,
    refetchInterval: 60000,
  })
}

