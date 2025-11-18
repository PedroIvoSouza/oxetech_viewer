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
  totalCertificados?: number
  totalCertificadosWork?: number
  totalCertificadosEdu?: number
  totalCertificadosTrilhas?: number
  totalCertificadosLab?: number
}

interface HomeData {
  data: {
    kpis: HomeKPIs & { totalMunicipios: number }
    evolucao12Meses: Array<{ mes: string; alunos: number }>
    evolucaoAlunos: Array<{ mes: string; total: number }>
    evolucaoWork: Array<{ mes: string; inscricoes: number }>
    funilWork: {
      inscricoes: number
      candidaturas: number
      contratacoes: number
    }
    conclusaoTrilhas: Array<{ trilha: string; total: number }>
    distribuicaoPrograma: {
      work: number
      edu: number
      lab: number
      trilhas: number
    }
  }
  error: string | null
}

async function fetchHomeData(): Promise<HomeData> {
  const response = await fetch('/api/home', {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch home data')
  }
  return response.json()
}

export function useHomeData() {
  return useQuery<HomeData, Error>({
    queryKey: ['home'],
    queryFn: fetchHomeData,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

