import { useQuery } from '@tanstack/react-query'

interface LabAgregadoData {
  data: {
    estatisticas: {
      totalTurmas: number
      totalInscritos: number
      totalFormados: number
      totalVagas: number
      taxaEvasao: number
      porFonte: {
        apenasBanco: number
        apenasCSV: number
        ambas: number
      }
    }
    turmas: Array<{
      id?: number
      titulo: string
      cursoNormalizado: string
      laboratorio: string
      dataInicio: Date
      dataEncerramento: Date
      qtdVagasTotal: number
      qtdVagasPreenchidas: number
      numFormados: number
      taxaEvasao?: number
      fontes: ('CSV' | 'BANCO')[]
      prevalencia: 'CSV' | 'BANCO' | 'AMBOS'
    }>
    porLaboratorio: Array<{
      laboratorio: string
      totalTurmas: number
      totalInscritos: number
      totalFormados: number
      totalVagas: number
      turmas: any[]
    }>
    porCurso: Array<{
      curso: string
      totalTurmas: number
      totalInscritos: number
      totalFormados: number
      totalVagas: number
      turmas: any[]
    }>
  }
  error: string | null
}

async function fetchLabAgregado(semIA: boolean = false): Promise<LabAgregadoData> {
  const url = `/api/lab/agregado${semIA ? '?sem-ia=true' : ''}`
  const response = await fetch(url, {
    credentials: 'include',
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch aggregated lab data')
  }
  
  return response.json()
}

export function useLabAgregado(semIA: boolean = false) {
  return useQuery<LabAgregadoData, Error>({
    queryKey: ['lab-agregado', semIA],
    queryFn: () => fetchLabAgregado(semIA),
    staleTime: 5 * 60 * 1000, // 5 minutos (dados agregados mudam pouco)
    gcTime: 15 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false, // Não refetch automático (dados agregados são estáveis)
    refetchOnReconnect: true,
  })
}

