import { useQuery } from '@tanstack/react-query'

interface LabData {
  data: {
    stats: {
      totalInscricoes: number
      inscricoesAtivas: number
      inscricoesFinalizadas: number
      inscricoesPorStatus: Array<{
        status: string
        total: number
      }>
      mediaPorLaboratorio: number
      totalVagas: number
      vagasOcupadas: number
      vagasLivres: number
    }
    distribuicaoPorCurso: Array<{
      curso: string
      total: number
    }>
    evolucaoTemporal: Array<{
      mes: string
      inscricoes: number
    }>
    evolucaoSemanal: Array<{
      semana: string
      inscricoes: number
    }>
    inscricoesPorLaboratorio: Array<{
      laboratorio: string
      municipio: string
      totalInscricoes: number
      totalCursos: number
      vagasOcupadas: number
      vagasTotal: number
      vagasLivres: number
    }>
    inscricoes: Array<{
      id: number
      aluno: string
      email: string
      curso: string
      laboratorio: string
      municipio: string
      status: string
      dataInscricao: Date
    }>
  }
  error: string | null
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

