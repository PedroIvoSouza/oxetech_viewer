import { useQuery } from '@tanstack/react-query'

interface HomeKPIs {
  totalAlunos: number
  totalEmpresas: number
  totalMatriculasEdu: number
  totalInscricoesWork: number
  totalVagasWork: number
  totalCandidaturasWork: number
  totalContratacoesWork: number
  totalTrilhas: number
  totalAtividadesConcluidas: number
  totalFrequencias: number
  totalInstrutores: number
  totalAgentes: number
}

interface HomeData {
  kpis: HomeKPIs
  evolucaoAlunos: Array<{ mes: string; total: number }>
  evolucaoWork: Array<{ mes: string; inscricoes: number }>
  funilWork: {
    inscricoes: number
    candidaturas: number
    contratacoes: number
  }
  conclusaoTrilhas: Array<{ trilha: string; total: number }>
}

async function fetchHomeData(): Promise<HomeData> {
  const response = await fetch('/api/home')
  if (!response.ok) {
    throw new Error('Failed to fetch home data')
  }
  return response.json()
}

export function useHomeData() {
  return useQuery<HomeData, Error>({
    queryKey: ['home'],
    queryFn: fetchHomeData,
    refetchInterval: 60000, // Refetch a cada 1 minuto
  })
}

